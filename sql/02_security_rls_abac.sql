-- =============================================================================
-- SIDAM SECURITY LAYER: RLS & ABAC CONFIGURATION
-- Descrição: Implementação de Multi-tenancy, Acesso Global e Super Dev Bypass.
-- =============================================================================

-- 1. FUNÇÕES AUXILIARES DE SEGURANÇA
-- -----------------------------------------------------------------------------

-- Função para capturar o perfil do usuário logado via JWT
CREATE OR REPLACE FUNCTION public.get_auth_profile() 
RETURNS TEXT AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'profile_slug')::TEXT;
$$ LANGUAGE sql STABLE;

-- Função para capturar a organização do usuário logado
CREATE OR REPLACE FUNCTION public.get_auth_org() 
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'organization_id')::UUID;
$$ LANGUAGE sql STABLE;

-- Função para capturar o CPF/CNPJ do contribuinte (Gov.br)
CREATE OR REPLACE FUNCTION public.get_auth_document() 
RETURNS TEXT AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'cpf_cnpj')::TEXT;
$$ LANGUAGE sql STABLE;

-- 2. HABILITAÇÃO DE RLS NAS TABELAS CRÍTICAS
-- -----------------------------------------------------------------------------
ALTER TABLE public.obj_fda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_cda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_pagamento_da ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_cadim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_blockchain_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sec_audit_log ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICA MESTRE: SUPER DEVELOPER (GOD MODE)
-- -----------------------------------------------------------------------------
-- O Super Dev tem acesso irrestrito a todas as tabelas para manutenção.
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name LIKE 'obj_%' OR table_name LIKE 'sec_%'
    LOOP
        EXECUTE format('CREATE POLICY "SuperDev_Bypass" ON public.%I FOR ALL TO authenticated USING (public.get_auth_profile() = ''super_dev'');', t);
    END LOOP;
END $$;

-- 4. POLÍTICAS PARA FICHA CADASTRAL (obj_fda)
-- -----------------------------------------------------------------------------

-- Visão Global para PGM e Procuradores
CREATE POLICY "PGM_Global_View" ON public.obj_fda
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'apoio_adm'));

-- Visão Restrita para Secretarias (Adm Externo)
CREATE POLICY "Secretaria_Org_Isolation" ON public.obj_fda
FOR ALL TO authenticated
USING (organization_id = public.get_auth_org());

-- Visão Restrita para o Contribuinte (Gov.br)
CREATE POLICY "Contribuinte_Own_Data" ON public.obj_fda
FOR SELECT TO authenticated
USING (documento_devedor = public.get_auth_document());

-- 5. POLÍTICAS PARA PAGAMENTOS (obj_pagamento_da)
-- -----------------------------------------------------------------------------

-- Somente Super Dev e Adm PGM podem ver o log bruto de todos os pagamentos
CREATE POLICY "Pagamento_View_Admin" ON public.obj_pagamento_da
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

-- Travamento de Exclusão: NINGUÉM apaga um pagamento (Imutabilidade)
CREATE POLICY "No_Delete_Pagamento" ON public.obj_pagamento_da
FOR DELETE TO authenticated
USING (false); -- Retorna falso para qualquer tentativa de deleção

-- 6. POLÍTICAS PARA AUDITORIA (sec_audit_log)
-- -----------------------------------------------------------------------------

-- Apenas Super Dev e Administrador PGM acessam logs de segurança
CREATE POLICY "Audit_Log_Admin_Only" ON public.sec_audit_log
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

-- 7. POLÍTICA DE SEGURANÇA ABAC: BLOQUEIO DE PROTESTO INDEVIDO
-- -----------------------------------------------------------------------------

-- Impede alteração de status para CDAs que possuem restrição judicial
CREATE POLICY "ABAC_Protecao_Judicial" ON public.obj_cda
FOR UPDATE TO authenticated
USING (
    (public.get_auth_profile() IN ('procurador_pgm', 'super_dev'))
    AND 
    NOT EXISTS (
        SELECT 1 FROM obj_fda f 
        WHERE f.id = obj_cda.fda_id AND f.status_atual = 'SUSPENSA'
    )
);
