-- =============================================================================
-- SIDAM - Sprint 2: Expansão de RLS + Hardening de privilégios
-- Depende de: 02_security_rls.sql, 07_integrations_layer.sql, 08_pix_revenue_layer.sql, 09_judicial_layer.sql
-- =============================================================================

-- 1) Habilitar RLS em tabelas adicionais
ALTER TABLE public.sys_integrations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_integration_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rev_pix_payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rev_pix_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jud_processes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jud_filing_batches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_event_outbox       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obj_integration_queue  ENABLE ROW LEVEL SECURITY;

-- 2) sys_integrations
DROP POLICY IF EXISTS "Integrations_Read" ON public.sys_integrations;
CREATE POLICY "Integrations_Read" ON public.sys_integrations
FOR SELECT TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

DROP POLICY IF EXISTS "Integrations_Write" ON public.sys_integrations;
CREATE POLICY "Integrations_Write" ON public.sys_integrations
FOR ALL TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
)
WITH CHECK (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

-- 3) sys_integration_logs
DROP POLICY IF EXISTS "IntegrationLogs_Read" ON public.sys_integration_logs;
CREATE POLICY "IntegrationLogs_Read" ON public.sys_integration_logs
FOR SELECT TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR EXISTS (
        SELECT 1
        FROM public.sys_integrations i
        WHERE i.id = sys_integration_logs.integration_id
          AND i.organization_id = public.get_auth_org()
    )
);

DROP POLICY IF EXISTS "IntegrationLogs_Insert" ON public.sys_integration_logs;
CREATE POLICY "IntegrationLogs_Insert" ON public.sys_integration_logs
FOR INSERT TO authenticated
WITH CHECK (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR EXISTS (
        SELECT 1
        FROM public.sys_integrations i
        WHERE i.id = sys_integration_logs.integration_id
          AND i.organization_id = public.get_auth_org()
    )
);

-- 4) rev_pix_payments
DROP POLICY IF EXISTS "PixPayments_Read" ON public.rev_pix_payments;
CREATE POLICY "PixPayments_Read" ON public.rev_pix_payments
FOR SELECT TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

DROP POLICY IF EXISTS "PixPayments_Write" ON public.rev_pix_payments;
CREATE POLICY "PixPayments_Write" ON public.rev_pix_payments
FOR ALL TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
)
WITH CHECK (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

-- 5) rev_pix_webhook_events
DROP POLICY IF EXISTS "PixWebhook_Read" ON public.rev_pix_webhook_events;
CREATE POLICY "PixWebhook_Read" ON public.rev_pix_webhook_events
FOR SELECT TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR EXISTS (
        SELECT 1
        FROM public.rev_pix_payments p
        WHERE p.id = rev_pix_webhook_events.pix_payment_id
          AND p.organization_id = public.get_auth_org()
    )
);

DROP POLICY IF EXISTS "PixWebhook_Insert" ON public.rev_pix_webhook_events;
CREATE POLICY "PixWebhook_Insert" ON public.rev_pix_webhook_events
FOR INSERT TO authenticated
WITH CHECK (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR EXISTS (
        SELECT 1
        FROM public.rev_pix_payments p
        WHERE p.id = rev_pix_webhook_events.pix_payment_id
          AND p.organization_id = public.get_auth_org()
    )
);

-- 6) jud_processes
DROP POLICY IF EXISTS "JudProcesses_Read" ON public.jud_processes;
CREATE POLICY "JudProcesses_Read" ON public.jud_processes
FOR SELECT TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

DROP POLICY IF EXISTS "JudProcesses_Write" ON public.jud_processes;
CREATE POLICY "JudProcesses_Write" ON public.jud_processes
FOR ALL TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
)
WITH CHECK (
    public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

-- 7) jud_filing_batches
DROP POLICY IF EXISTS "JudBatches_Read" ON public.jud_filing_batches;
CREATE POLICY "JudBatches_Read" ON public.jud_filing_batches
FOR SELECT TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

DROP POLICY IF EXISTS "JudBatches_Write" ON public.jud_filing_batches;
CREATE POLICY "JudBatches_Write" ON public.jud_filing_batches
FOR ALL TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
)
WITH CHECK (
    public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

-- 8) sys_event_outbox
DROP POLICY IF EXISTS "Outbox_Read" ON public.sys_event_outbox;
CREATE POLICY "Outbox_Read" ON public.sys_event_outbox
FOR SELECT TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

DROP POLICY IF EXISTS "Outbox_Write" ON public.sys_event_outbox;
CREATE POLICY "Outbox_Write" ON public.sys_event_outbox
FOR ALL TO authenticated
USING (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
)
WITH CHECK (
    public.get_auth_profile() IN ('adm_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

-- 9) obj_integration_queue (fila sistêmica sem organization_id)
DROP POLICY IF EXISTS "IntegrationQueue_Admin_Only" ON public.obj_integration_queue;
CREATE POLICY "IntegrationQueue_Admin_Only" ON public.obj_integration_queue
FOR ALL TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'super_dev'))
WITH CHECK (public.get_auth_profile() IN ('adm_pgm', 'super_dev'));

-- 10) Hardening de privilégios nas funções auxiliares de auth
REVOKE ALL ON FUNCTION public.get_auth_profile() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_auth_org() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_auth_document() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_auth_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_org() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_document() TO authenticated;
