-- =============================================================================
-- SIDAM - Judicial Layer: Integração TJAM (MNI/SAJ)
-- Depende de: 01_core_schema.sql
-- Sprint: 9
-- =============================================================================

-- 1. PROCESSOS JUDICIAIS
CREATE TABLE IF NOT EXISTS public.jud_processes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    cda_id          UUID NOT NULL REFERENCES public.obj_cda(id) ON DELETE RESTRICT,
    process_number  TEXT UNIQUE,
    status          TEXT DEFAULT 'AGUARDANDO_ENVIO'
                        CHECK (status IN ('AGUARDANDO_ENVIO','EM_PROCESSAMENTO','AJUIZADO','ERRO')),
    tribunal_slug   TEXT DEFAULT 'tjam',
    protocol_number TEXT,
    filed_at        TIMESTAMPTZ,
    last_sync_at    TIMESTAMPTZ DEFAULT now(),
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. LOTES DE AJUIZAMENTO
CREATE TABLE IF NOT EXISTS public.jud_filing_batches (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    batch_name       TEXT NOT NULL,
    total_items      INTEGER DEFAULT 0,
    processed_items  INTEGER DEFAULT 0,
    status           TEXT DEFAULT 'ABERTO'
                         CHECK (status IN ('ABERTO','ENVIADO','CONCLUIDO','FALHA')),
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_jud_process_status  ON public.jud_processes(status);
CREATE INDEX IF NOT EXISTS idx_jud_cda_id          ON public.jud_processes(cda_id);
CREATE INDEX IF NOT EXISTS idx_jud_organization    ON public.jud_processes(organization_id);
CREATE INDEX IF NOT EXISTS idx_jud_batches_org     ON public.jud_filing_batches(organization_id);
