-- =============================================================================
-- SIDAM REVENUE LAYER: PIX PAYMENTS & WEBHOOKS
-- Descrição: Gestão de pagamentos instantâneos via PIX Dinâmico.
-- =============================================================================

BEGIN;

-- 1. TABELA DE PAGAMENTOS PIX
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rev_pix_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    txid TEXT UNIQUE NOT NULL, -- Identificador único da transação PIX
    devedor_id UUID, -- Referência ao contribuinte/devedor
    divida_id UUID, -- Referência à CDA ou débito
    valor NUMERIC(15,2) NOT NULL,
    status TEXT DEFAULT 'PENDENTE', -- 'PENDENTE', 'CONCLUIDO', 'EXPIRADO', 'REJEITADO'
    qr_code TEXT, -- Payload do QR Code (EMV)
    pix_copia_e_cola TEXT,
    pago_em TIMESTAMP WITH TIME ZONE,
    expira_em TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. TABELA DE EVENTOS DE WEBHOOK (AUDITORIA DE RECEBIMENTO)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rev_pix_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pix_payment_id UUID REFERENCES public.rev_pix_payments(id),
    provider_slug TEXT NOT NULL, -- ex: 'itau', 'bb', 'inter'
    raw_payload JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT NOT NULL -- 'PROCESSADO', 'ERRO', 'DUPLICADO'
);

-- 3. ÍNDICES PARA PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pix_txid ON public.rev_pix_payments(txid);
CREATE INDEX IF NOT EXISTS idx_pix_status ON public.rev_pix_payments(status);

COMMIT;
