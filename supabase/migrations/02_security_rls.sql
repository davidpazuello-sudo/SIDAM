-- SIDAM - Fase 1: Security RLS
-- Objetivo: Isolar dados entre organizações e perfis

-- Ativando RLS nas tabelas críticas
ALTER TABLE public.obj_fda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_blockchain_ledger ENABLE ROW LEVEL SECURITY;

-- 1. Política para a Ficha Cadastral (FDA)
-- Administradores da PGM veem tudo. Secretarias veem apenas seus próprios débitos.
CREATE POLICY "RLS_FDA_Isolation" ON public.obj_fda
FOR ALL
TO authenticated
USING (
    (organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::uuid)
    OR 
    (EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND profile_slug IN ('adm_pgm', 'procurador_pgm')
    ))
);

-- 2. Política para o Ledger de Blockchain (Apenas Leitura Global)
CREATE POLICY "RLS_Blockchain_Read" ON public.obj_blockchain_ledger
FOR SELECT
TO authenticated
USING (true);

-- 3. Política para Tabelas de Configuração (Leitura Global, Escrita apenas ADM)
ALTER TABLE public.cfg_object_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RLS_Config_Read" ON public.cfg_object_types FOR SELECT TO authenticated USING (true);

ALTER TABLE public.cfg_object_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RLS_Config_Props_Read" ON public.cfg_object_properties FOR SELECT TO authenticated USING (true);
