-- =============================================================================
-- SIDAM - Sprint 6 Test Cases: Governança, Release e Evidência de Backup
-- =============================================================================

BEGIN;

-- 1) Inserir checklist de release (idempotência por release_tag+environment)
INSERT INTO public.sys_db_release_checklists (release_tag, environment, checks, status)
VALUES (
  'release-s6-test',
  'hml',
  '[{"item":"backup_ok","status":"done"},{"item":"rollback_plan","status":"done"}]'::jsonb,
  'APROVADO'
)
ON CONFLICT (release_tag, environment) DO UPDATE
SET checks = EXCLUDED.checks,
    status = EXCLUDED.status,
    executed_at = now();

-- 2) Registrar evidência de backup/restore
INSERT INTO public.sys_backup_restore_evidence (
  environment,
  backup_reference,
  restored_at,
  rto_minutes,
  rpo_minutes,
  status,
  evidence_url,
  notes
) VALUES (
  'hml',
  'backup://sidam/hml/2026-03-24T10:00:00Z',
  now(),
  18,
  7,
  'SUCESSO',
  'https://example.local/evidencias/restore-hml-20260324',
  'Restore de validação Sprint 6'
);

-- 3) Registrar versão de contrato de dados
SELECT public.fn_register_data_contract_version(
  'fda_core',
  '1.0.0',
  'NON_BREAKING',
  'Adição de regras de governança e checklist de release',
  'supabase/migrations/13_sprint6_governance_scale.sql',
  NULL
) AS contract_version_id;

-- 4) Consultar visão de candidatos a particionamento
SELECT *
FROM public.monitor_partition_candidates
ORDER BY total_bytes DESC;

ROLLBACK;
