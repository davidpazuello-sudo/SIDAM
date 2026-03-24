-- =============================================================================
-- SIDAM - PIX Revenue Layer: Pagamentos Instantâneos e Webhooks
-- Depende de: 01_core_schema.sql
-- Sprint: 6
-- =============================================================================

-- 1. PAGAMENTOS PIX
CREATE TABLE IF NOT EXISTS public.rev_pix_payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    txid            TEXT UNIQUE NOT NULL,
    devedor_id      UUID,
    divida_id       UUID REFERENCES public.obj_cda(id) ON DELETE RESTRICT,
    valor           NUMERIC(15,2) NOT NULL,
    status          TEXT DEFAULT 'PENDENTE'
                        CHECK (status IN ('PENDENTE','CONCLUIDO','EXPIRADO','REJEITADO')),
    qr_code         TEXT,
    pix_copia_e_cola TEXT,
    pago_em         TIMESTAMPTZ,
    expira_em       TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. EVENTOS DE WEBHOOK (Auditoria de recebimento do PSP)
CREATE TABLE IF NOT EXISTS public.rev_pix_webhook_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pix_payment_id  UUID REFERENCES public.rev_pix_payments(id) ON DELETE CASCADE,
    provider_slug   TEXT NOT NULL,
    raw_payload     JSONB NOT NULL,
    processed_at    TIMESTAMPTZ DEFAULT now(),
    status          TEXT NOT NULL CHECK (status IN ('PROCESSADO','ERRO','DUPLICADO'))
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_pix_txid         ON public.rev_pix_payments(txid);
CREATE INDEX IF NOT EXISTS idx_pix_status        ON public.rev_pix_payments(status);
CREATE INDEX IF NOT EXISTS idx_pix_organization  ON public.rev_pix_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_pix_webhook_payment ON public.rev_pix_webhook_events(pix_payment_id);
