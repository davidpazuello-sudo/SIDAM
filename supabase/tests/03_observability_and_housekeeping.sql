-- =============================================================================
-- SIDAM - Sprint 5 Test Cases: Observabilidade e Housekeeping
-- =============================================================================

BEGIN;

-- 1) Views operacionais existem e respondem
SELECT * FROM public.monitor_outbox_backlog LIMIT 5;
SELECT * FROM public.monitor_integration_queue_backlog LIMIT 5;
SELECT * FROM public.monitor_integrations_health LIMIT 5;
SELECT * FROM public.monitor_db_locks LIMIT 5;
SELECT * FROM public.monitor_table_growth LIMIT 5;
SELECT * FROM public.monitor_alertas_operacionais LIMIT 5;

-- 2) Função de housekeeping responde com JSON esperado
SELECT public.fn_run_housekeeping(90) AS housekeeping_result;

-- 3) Registro de execução criado
SELECT id, retention_days, status, executed_at
FROM public.sys_housekeeping_runs
ORDER BY executed_at DESC
LIMIT 5;

ROLLBACK;
