-- =============================================================================
-- SIDAM - Sprint 6: Governança Avançada, Release e Evidências de Backup/Restore
-- Depende de: 10_security_rls_expansion.sql, 12_sprint5_observability_ops.sql
-- =============================================================================

-- 1) Registro de contratos de dados
CREATE TABLE IF NOT EXISTS public.sys_data_contracts (
    slug TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    owner_team TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ATIVO'
        CHECK (status IN ('ATIVO', 'DEPRECADO', 'ARQUIVADO')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sys_data_contract_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_slug TEXT NOT NULL REFERENCES public.sys_data_contracts(slug) ON DELETE CASCADE,
    version_semver TEXT NOT NULL,
    change_type TEXT NOT NULL
        CHECK (change_type IN ('NON_BREAKING', 'BREAKING')),
    ddl_reference TEXT,
    changelog TEXT NOT NULL,
    effective_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deprecates_at TIMESTAMPTZ,
    created_by UUID DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (contract_slug, version_semver)
);

CREATE INDEX IF NOT EXISTS idx_data_contract_versions_slug
ON public.sys_data_contract_versions(contract_slug, effective_at DESC);

-- 2) Evidências de backup/restore e metas RTO/RPO
CREATE TABLE IF NOT EXISTS public.sys_backup_restore_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment TEXT NOT NULL CHECK (environment IN ('dev', 'hml', 'prod')),
    backup_reference TEXT NOT NULL,
    restored_at TIMESTAMPTZ NOT NULL,
    rto_minutes INTEGER NOT NULL CHECK (rto_minutes >= 0),
    rpo_minutes INTEGER NOT NULL CHECK (rpo_minutes >= 0),
    status TEXT NOT NULL CHECK (status IN ('SUCESSO', 'FALHA')),
    evidence_url TEXT,
    notes TEXT,
    created_by UUID DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backup_restore_env_date
ON public.sys_backup_restore_evidence(environment, restored_at DESC);

-- 3) Checklist de release de banco
CREATE TABLE IF NOT EXISTS public.sys_db_release_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_tag TEXT NOT NULL,
    environment TEXT NOT NULL CHECK (environment IN ('dev', 'hml', 'prod')),
    checks JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'EM_PROGRESSO'
        CHECK (status IN ('EM_PROGRESSO', 'APROVADO', 'REPROVADO')),
    executed_by UUID DEFAULT auth.uid(),
    executed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (release_tag, environment)
);

CREATE INDEX IF NOT EXISTS idx_release_checklist_env_tag
ON public.sys_db_release_checklists(environment, release_tag);

-- 4) Visão de candidatos a particionamento (alto volume)
CREATE OR REPLACE VIEW public.monitor_partition_candidates AS
SELECT
    c.relname AS table_name,
    c.reltuples::BIGINT AS row_estimate,
    pg_total_relation_size(c.oid) AS total_bytes,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS total_pretty,
    CASE
        WHEN c.reltuples >= 1000000 THEN 'ALTA'
        WHEN c.reltuples >= 100000 THEN 'MEDIA'
        ELSE 'BAIXA'
    END AS prioridade_particionamento
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('sys_integration_logs', 'rev_pix_webhook_events', 'sec_audit_log')
ORDER BY pg_total_relation_size(c.oid) DESC;

-- 5) Função utilitária para versão de contrato de dados
CREATE OR REPLACE FUNCTION public.fn_register_data_contract_version(
    p_contract_slug TEXT,
    p_version_semver TEXT,
    p_change_type TEXT,
    p_changelog TEXT,
    p_ddl_reference TEXT DEFAULT NULL,
    p_deprecates_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_change_type NOT IN ('NON_BREAKING', 'BREAKING') THEN
        RAISE EXCEPTION 'p_change_type inválido: %', p_change_type;
    END IF;

    INSERT INTO public.sys_data_contract_versions (
        contract_slug,
        version_semver,
        change_type,
        ddl_reference,
        changelog,
        deprecates_at
    ) VALUES (
        p_contract_slug,
        p_version_semver,
        p_change_type,
        p_ddl_reference,
        p_changelog,
        p_deprecates_at
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_register_data_contract_version(TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_register_data_contract_version(TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) TO authenticated;

-- 6) RLS para tabelas de governança
ALTER TABLE public.sys_data_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_data_contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_backup_restore_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_db_release_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "DataContracts_Read_Admin" ON public.sys_data_contracts;
CREATE POLICY "DataContracts_Read_Admin" ON public.sys_data_contracts
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

DROP POLICY IF EXISTS "DataContracts_Write_Admin" ON public.sys_data_contracts;
CREATE POLICY "DataContracts_Write_Admin" ON public.sys_data_contracts
FOR ALL TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'))
WITH CHECK (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

DROP POLICY IF EXISTS "DataContractVersions_Read_Admin" ON public.sys_data_contract_versions;
CREATE POLICY "DataContractVersions_Read_Admin" ON public.sys_data_contract_versions
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

DROP POLICY IF EXISTS "DataContractVersions_Write_Admin" ON public.sys_data_contract_versions;
CREATE POLICY "DataContractVersions_Write_Admin" ON public.sys_data_contract_versions
FOR ALL TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'))
WITH CHECK (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

DROP POLICY IF EXISTS "BackupEvidence_Read_Admin" ON public.sys_backup_restore_evidence;
CREATE POLICY "BackupEvidence_Read_Admin" ON public.sys_backup_restore_evidence
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

DROP POLICY IF EXISTS "BackupEvidence_Write_Admin" ON public.sys_backup_restore_evidence;
CREATE POLICY "BackupEvidence_Write_Admin" ON public.sys_backup_restore_evidence
FOR ALL TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'))
WITH CHECK (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

DROP POLICY IF EXISTS "ReleaseChecklist_Read_Admin" ON public.sys_db_release_checklists;
CREATE POLICY "ReleaseChecklist_Read_Admin" ON public.sys_db_release_checklists
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

DROP POLICY IF EXISTS "ReleaseChecklist_Write_Admin" ON public.sys_db_release_checklists;
CREATE POLICY "ReleaseChecklist_Write_Admin" ON public.sys_db_release_checklists
FOR ALL TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'))
WITH CHECK (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

-- 7) Seeds iniciais de contrato (idempotente)
INSERT INTO public.sys_data_contracts (slug, domain, owner_team, status)
VALUES
  ('fda_core', 'divida_ativa', 'dados_fiscais', 'ATIVO'),
  ('integrations_log', 'integracoes', 'plataforma', 'ATIVO'),
  ('pix_revenue', 'arrecadacao', 'financeiro', 'ATIVO')
ON CONFLICT (slug) DO UPDATE SET
  domain = EXCLUDED.domain,
  owner_team = EXCLUDED.owner_team,
  status = EXCLUDED.status,
  updated_at = now();
