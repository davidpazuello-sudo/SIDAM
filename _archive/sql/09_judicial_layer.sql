-- =============================================================================
-- SIDAM JUDICIAL LAYER: TJAM INTEGRATION (MNI / SAJ)
-- Descrição: Gestão de execuções fiscais e ajuizamento em lote.
-- =============================================================================

BEGIN;

-- 1. TABELA DE PROCESSOS JUDICIAIS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jud_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    cda_id UUID NOT NULL, -- Referência à Certidão de Dívida Ativa
    process_number TEXT UNIQUE, -- Número do processo gerado pelo Tribunal
    status TEXT DEFAULT 'AGUARDANDO_ENVIO', -- 'AGUARDANDO_ENVIO', 'EM_PROCESSAMENTO', 'AJUIZADO', 'ERRO'
    tribunal_slug TEXT DEFAULT 'tjam',
    protocol_number TEXT, -- Protocolo de recebimento do tribunal
    filed_at TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. TABELA DE LOTES DE AJUIZAMENTO
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jud_filing_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    batch_name TEXT NOT NULL,
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ABERTO', -- 'ABERTO', 'ENVIADO', 'CONCLUIDO', 'FALHA'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. ÍNDICES PARA PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_jud_process_status ON public.jud_processes(status);
CREATE INDEX IF NOT EXISTS idx_jud_cda_id ON public.jud_processes(cda_id);

COMMIT;
