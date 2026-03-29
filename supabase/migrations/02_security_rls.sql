-- =============================================================================
-- SIDAM - Security Layer: RLS + ABAC + Auth Helper Functions
-- Depende de: 01_core_schema.sql
-- =============================================================================

-- 1. FUNÇÕES AUXILIARES DE AUTENTICAÇÃO
-- -----------------------------------------------------------------------------

-- Captura o perfil do usuário:
-- Prioridade 1: JWT user_metadata.profile_slug
-- Prioridade 2: Tabela sec_user_profiles (fallback por email)
-- Prioridade 3: 'contribuinte' (padrão público)
CREATE OR REPLACE FUNCTION public.get_auth_profile()
RETURNS TEXT AS $$
DECLARE
    v_profile TEXT;
    v_email   TEXT;
BEGIN
    v_email   := (auth.jwt() ->> 'email')::TEXT;
    v_profile := (auth.jwt() -> 'user_metadata' ->> 'profile_slug')::TEXT;

    IF v_profile IS NULL AND v_email IS NOT NULL THEN
        SELECT profile_slug INTO v_profile
        FROM public.sec_user_profiles
        WHERE email = v_email;
    END IF;

    RETURN COALESCE(v_profile, 'contribuinte');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

-- Captura a organização do usuário logado via JWT
CREATE OR REPLACE FUNCTION public.get_auth_org()
RETURNS UUID AS $$
    SELECT (auth.jwt() -> 'user_metadata' ->> 'organization_id')::UUID;
$$ LANGUAGE sql STABLE
SET search_path = public, pg_temp;

-- Captura CPF/CNPJ do contribuinte autenticado via Gov.br
CREATE OR REPLACE FUNCTION public.get_auth_document()
RETURNS TEXT AS $$
    SELECT (auth.jwt() -> 'user_metadata' ->> 'cpf_cnpj')::TEXT;
$$ LANGUAGE sql STABLE
SET search_path = public, pg_temp;

-- 2. HABILITAR RLS NAS TABELAS CRÍTICAS
-- -----------------------------------------------------------------------------
ALTER TABLE public.obj_fda              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_cda              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_pagamento_da     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_cadim            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_blockchain_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sec_audit_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sec_user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cfg_object_types     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cfg_object_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_branding         ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS PARA FDA (obj_fda)
-- -----------------------------------------------------------------------------

-- PGM e Procuradores têm visão global (todos os tenants)
DROP POLICY IF EXISTS "PGM_Global_View" ON public.obj_fda;
CREATE POLICY "PGM_Global_View" ON public.obj_fda
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'apoio_adm', 'super_dev'));

-- Secretarias veem apenas dados da própria organização
DROP POLICY IF EXISTS "Secretaria_Org_Isolation" ON public.obj_fda;
CREATE POLICY "Secretaria_Org_Isolation" ON public.obj_fda
FOR ALL TO authenticated
USING (organization_id = public.get_auth_org());

-- Contribuinte vê apenas seus próprios débitos
DROP POLICY IF EXISTS "Contribuinte_Own_Data" ON public.obj_fda;
CREATE POLICY "Contribuinte_Own_Data" ON public.obj_fda
FOR SELECT TO authenticated
USING (documento_devedor = public.get_auth_document());

-- 4. POLÍTICAS PARA PAGAMENTOS (obj_pagamento_da)
-- -----------------------------------------------------------------------------

-- Admins e usuários da org podem consultar pagamentos
DROP POLICY IF EXISTS "Pagamento_View" ON public.obj_pagamento_da;
CREATE POLICY "Pagamento_View" ON public.obj_pagamento_da
FOR SELECT TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

-- IMUTABILIDADE: Nenhum usuário pode deletar um pagamento
DROP POLICY IF EXISTS "No_Delete_Pagamento" ON public.obj_pagamento_da;
CREATE POLICY "No_Delete_Pagamento" ON public.obj_pagamento_da
FOR DELETE TO authenticated
USING (false);

-- 5. POLÍTICA ABAC: PROTEÇÃO CONTRA ALTERAÇÃO EM PROCESSO JUDICIAL (obj_cda)
-- -----------------------------------------------------------------------------
-- Impede alteração de CDA cujo FDA está com status SUSPENSA (restrição judicial ativa)
DROP POLICY IF EXISTS "ABAC_Protecao_Judicial" ON public.obj_cda;
CREATE POLICY "ABAC_Protecao_Judicial" ON public.obj_cda
FOR UPDATE TO authenticated
USING (
    public.get_auth_profile() IN ('procurador_pgm', 'super_dev')
    AND NOT EXISTS (
        SELECT 1 FROM public.obj_fda f
        WHERE f.id = obj_cda.fda_id
          AND f.status_atual = 'SUSPENSA'
    )
);

-- 6. POLÍTICAS PARA BLOCKCHAIN (Somente leitura para autenticados)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "RLS_Blockchain_Read" ON public.obj_blockchain_ledger;
CREATE POLICY "RLS_Blockchain_Read" ON public.obj_blockchain_ledger
FOR SELECT TO authenticated
USING (true);

-- 7. POLÍTICAS PARA AUDITORIA (sec_audit_log)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Audit_Log_Admin_Only" ON public.sec_audit_log;
CREATE POLICY "Audit_Log_Admin_Only" ON public.sec_audit_log
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

-- 8. POLÍTICAS PARA PERFIS DE USUÁRIO (sec_user_profiles)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "UserProfiles_Admin_Only" ON public.sec_user_profiles;
CREATE POLICY "UserProfiles_Admin_Only" ON public.sec_user_profiles
FOR ALL TO authenticated
USING (public.get_auth_profile() = 'super_dev');

-- 9. POLÍTICAS PARA CONFIG ENGINE (cfg_object_types, cfg_object_properties)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "RLS_Config_Read" ON public.cfg_object_types;
CREATE POLICY "RLS_Config_Read" ON public.cfg_object_types
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "RLS_Config_Props_Read" ON public.cfg_object_properties;
CREATE POLICY "RLS_Config_Props_Read" ON public.cfg_object_properties
FOR SELECT TO authenticated USING (true);

-- 10. POLÍTICAS PARA BRANDING (sys_branding)
-- -----------------------------------------------------------------------------
-- Leitura global (qualquer autenticado pode ver o tema da sua prefeitura)
DROP POLICY IF EXISTS "RLS_Branding_Read" ON public.sys_branding;
CREATE POLICY "RLS_Branding_Read" ON public.sys_branding
FOR SELECT TO authenticated USING (true);

-- Escrita restrita a Admin e Super Dev
DROP POLICY IF EXISTS "RLS_Branding_Write" ON public.sys_branding;
CREATE POLICY "RLS_Branding_Write" ON public.sys_branding
FOR ALL TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));
