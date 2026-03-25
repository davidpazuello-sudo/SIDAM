-- =============================================================================
-- SIDAM - Sprint 5: Observabilidade, Alertas Operacionais e Housekeeping
-- Depende de: 01_core_schema.sql, 05_sanity_monitor.sql, 07_integrations_layer.sql, 08_pix_revenue_layer.sql, 10_security_rls_expansion.sql, 11_sprint3_data_integrity.sql
-- =============================================================================

-- 1) Views operacionais: backlog de outbox e filas
CREATE OR REPLACE VIEW public.monitor_outbox_backlog AS
SELECT
    organization_id,
    status,
    COUNT(*) AS total_eventos,
    MIN(created_at) AS evento_mais_antigo,
    MAX(created_at) AS evento_mais_recente,
    EXTRACT(EPOCH FROM (now() - MIN(created_at)))::BIGINT AS oldest_age_seconds
FROM public.sys_event_outbox
GROUP BY organization_id, status;

CREATE OR REPLACE VIEW public.monitor_integration_queue_backlog AS
SELECT
    status,
    COUNT(*) AS total_itens,
    MIN(created_at) AS item_mais_antigo,
    MAX(created_at) AS item_mais_recente,
    MAX(tentativas) AS max_tentativas
FROM public.obj_integration_queue
GROUP BY status;

-- 2) Saúde de integrações (erro, timeout e latência)
CREATE OR REPLACE VIEW public.monitor_integrations_health AS
SELECT
    i.organization_id,
    i.slug,
    i.name,
    i.status AS integration_status,
    COUNT(l.id) FILTER (WHERE l.created_at >= now() - INTERVAL '24 hours') AS execucoes_24h,
    COUNT(l.id) FILTER (
        WHERE l.created_at >= now() - INTERVAL '24 hours'
          AND l.status IN ('FALHA', 'TIMEOUT')
    ) AS falhas_24h,
    ROUND(
        AVG(l.duration_ms)::NUMERIC,
        2
    ) FILTER (WHERE l.created_at >= now() - INTERVAL '24 hours') AS latencia_media_ms_24h,
    MAX(l.created_at) AS ultima_execucao
FROM public.sys_integrations i
LEFT JOIN public.sys_integration_logs l ON l.integration_id = i.id
GROUP BY i.organization_id, i.slug, i.name, i.status;

-- 3) Observabilidade de locks e queries ativas
CREATE OR REPLACE VIEW public.monitor_db_locks AS
SELECT
    a.pid,
    a.usename,
    a.application_name,
    a.client_addr,
    a.state,
    a.wait_event_type,
    a.wait_event,
    now() - a.query_start AS query_duration,
    l.locktype,
    l.mode,
    l.granted,
    left(a.query, 250) AS query_excerpt
FROM pg_locks l
JOIN pg_stat_activity a ON a.pid = l.pid
WHERE a.datname = current_database();

-- 4) Crescimento por tabela (top 30)
CREATE OR REPLACE VIEW public.monitor_table_growth AS
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    pg_total_relation_size(c.oid) AS total_bytes,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS total_pretty,
    pg_relation_size(c.oid) AS heap_bytes,
    pg_size_pretty(pg_relation_size(c.oid)) AS heap_pretty,
    pg_indexes_size(c.oid) AS indexes_bytes,
    pg_size_pretty(pg_indexes_size(c.oid)) AS indexes_pretty,
    c.reltuples::BIGINT AS row_estimate
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
ORDER BY pg_total_relation_size(c.oid) DESC
LIMIT 30;

-- 5) Alertas operacionais consolidados
CREATE OR REPLACE VIEW public.monitor_alertas_operacionais AS
SELECT
    'OUTBOX_BACKLOG_CRITICO'::TEXT AS alert_code,
    o.organization_id,
    format('Outbox pendente com item mais antigo há %s segundos', o.oldest_age_seconds) AS descricao,
    CASE
        WHEN o.oldest_age_seconds > 7200 THEN 'CRITICO'
        WHEN o.oldest_age_seconds > 1800 THEN 'ALTO'
        ELSE 'INFO'
    END AS severidade,
    now() AS created_at
FROM public.monitor_outbox_backlog o
WHERE o.status = 'PENDENTE'
  AND o.oldest_age_seconds > 1800

UNION ALL

SELECT
    'INTEGRATION_FAILURE_RATE'::TEXT AS alert_code,
    h.organization_id,
    format('Integração %s possui %s falhas/timeouts em 24h', h.slug, h.falhas_24h) AS descricao,
    CASE
        WHEN h.falhas_24h >= 20 THEN 'CRITICO'
        WHEN h.falhas_24h >= 5 THEN 'ALTO'
        ELSE 'INFO'
    END AS severidade,
    now() AS created_at
FROM public.monitor_integrations_health h
WHERE h.falhas_24h >= 5

UNION ALL

SELECT
    'PAYMENT_BAIXA_DIVERGENCIA'::TEXT AS alert_code,
    f.organization_id,
    format('Dívida %s com pagamento sem baixa', f.numero_inscricao) AS descricao,
    'CRITICO'::TEXT AS severidade,
    now() AS created_at
FROM public.obj_pagamento_da p
JOIN public.obj_fda f ON f.id = p.fda_id
WHERE f.status_atual = 'ATIVA';

-- 6) Controle de housekeeping
CREATE TABLE IF NOT EXISTS public.sys_housekeeping_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executed_at TIMESTAMPTZ DEFAULT now(),
    retention_days INTEGER NOT NULL,
    deleted_integration_logs INTEGER NOT NULL DEFAULT 0,
    deleted_webhook_events INTEGER NOT NULL DEFAULT 0,
    deleted_audit_rows INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'SUCESSO'
        CHECK (status IN ('SUCESSO', 'FALHA')),
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_housekeeping_runs_executed_at
ON public.sys_housekeeping_runs(executed_at DESC);

ALTER TABLE public.sys_housekeeping_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "HousekeepingRuns_Read_Admin" ON public.sys_housekeeping_runs;
CREATE POLICY "HousekeepingRuns_Read_Admin" ON public.sys_housekeeping_runs
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

DROP POLICY IF EXISTS "HousekeepingRuns_Insert_Admin" ON public.sys_housekeeping_runs;
CREATE POLICY "HousekeepingRuns_Insert_Admin" ON public.sys_housekeeping_runs
FOR INSERT TO authenticated
WITH CHECK (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

-- 7) Função de housekeeping (retenção)
CREATE OR REPLACE FUNCTION public.fn_run_housekeeping(p_retention_days INTEGER DEFAULT 90)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_deleted_logs      INTEGER := 0;
    v_deleted_webhooks  INTEGER := 0;
    v_deleted_audit     INTEGER := 0;
BEGIN
    IF p_retention_days < 7 THEN
        RAISE EXCEPTION 'p_retention_days deve ser >= 7';
    END IF;

    DELETE FROM public.sys_integration_logs
    WHERE created_at < now() - make_interval(days => p_retention_days);
    GET DIAGNOSTICS v_deleted_logs = ROW_COUNT;

    DELETE FROM public.rev_pix_webhook_events
    WHERE processed_at < now() - make_interval(days => p_retention_days);
    GET DIAGNOSTICS v_deleted_webhooks = ROW_COUNT;

    DELETE FROM public.sec_audit_log
    WHERE created_at < now() - make_interval(days => p_retention_days * 2);
    GET DIAGNOSTICS v_deleted_audit = ROW_COUNT;

    INSERT INTO public.sys_housekeeping_runs (
        retention_days,
        deleted_integration_logs,
        deleted_webhook_events,
        deleted_audit_rows,
        status
    ) VALUES (
        p_retention_days,
        v_deleted_logs,
        v_deleted_webhooks,
        v_deleted_audit,
        'SUCESSO'
    );

    RETURN jsonb_build_object(
        'retention_days', p_retention_days,
        'deleted_integration_logs', v_deleted_logs,
        'deleted_webhook_events', v_deleted_webhooks,
        'deleted_audit_rows', v_deleted_audit,
        'status', 'SUCESSO'
    );
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO public.sys_housekeeping_runs (
            retention_days,
            status,
            error_message
        ) VALUES (
            p_retention_days,
            'FALHA',
            SQLERRM
        );

        RETURN jsonb_build_object(
            'retention_days', p_retention_days,
            'status', 'FALHA',
            'error', SQLERRM
        );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_run_housekeeping(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_run_housekeeping(INTEGER) TO authenticated;
