-- =============================================================================
-- SIDAM - Integrations Layer: Configuração e Logs de Integrações Externas
-- Depende de: 01_core_schema.sql
-- Sprint: 6
-- =============================================================================

-- 1. CONFIGURAÇÃO DE INTEGRAÇÕES EXTERNAS
CREATE TABLE IF NOT EXISTS public.sys_integrations (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id        UUID NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    slug                   TEXT NOT NULL,
    category               TEXT NOT NULL,
    name                   TEXT NOT NULL,
    description            TEXT,
    config                 JSONB DEFAULT '{}',
    status                 TEXT DEFAULT 'INATIVO'
                               CHECK (status IN ('ATIVO','INATIVO','ERRO','MANUTENCAO')),
    last_sync_at           TIMESTAMPTZ,
    circuit_breaker_active BOOLEAN DEFAULT false,
    created_at             TIMESTAMPTZ DEFAULT now(),
    updated_at             TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, slug)
);

-- 2. LOGS DE EXECUÇÃO DE INTEGRAÇÕES
CREATE TABLE IF NOT EXISTS public.sys_integration_logs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id    UUID REFERENCES public.sys_integrations(id) ON DELETE CASCADE,
    status            TEXT NOT NULL CHECK (status IN ('SUCESSO','FALHA','TIMEOUT')),
    duration_ms       INTEGER,
    request_payload   JSONB,
    response_payload  JSONB,
    error_message     TEXT,
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_integrations_org        ON public.sys_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status     ON public.sys_integrations(status);
CREATE INDEX IF NOT EXISTS idx_int_logs_integration    ON public.sys_integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_int_logs_created_at     ON public.sys_integration_logs(created_at);
