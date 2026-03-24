-- =============================================================================
-- SIDAM - Core Schema (Source of Truth)
-- Stack: PostgreSQL + PostGIS + pgcrypto (Supabase)
-- Ordem de execução: Este arquivo deve ser o primeiro a rodar.
-- =============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. ESTRUTURA ORGANIZACIONAL (Multi-tenancy)
CREATE TABLE IF NOT EXISTS public.sec_organization (
    id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PERFIS DE USUÁRIO (Mapeamento email → perfil, fallback do JWT)
CREATE TABLE IF NOT EXISTS public.sec_user_profiles (
    email       TEXT PRIMARY KEY,
    profile_slug TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. AUDITORIA DE SEGURANÇA
CREATE TABLE IF NOT EXISTS public.sec_audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.sec_organization(id) ON DELETE SET NULL,
    user_id         UUID,
    severidade      VARCHAR(20) NOT NULL DEFAULT 'INFO'
                        CHECK (severidade IN ('INFO', 'AVISO', 'CRITICO')),
    evento_tipo     VARCHAR(100) NOT NULL,
    detalhes        JSONB,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 5. FICHA CADASTRAL DA DÍVIDA ATIVA (FDA) — Entidade central
CREATE TABLE IF NOT EXISTS public.obj_fda (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id           UUID NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    numero_inscricao          VARCHAR(30) UNIQUE NOT NULL,
    documento_devedor         VARCHAR(18) NOT NULL,
    devedor_nome              TEXT NOT NULL,
    valor_principal_inscrito  NUMERIC(15,2) NOT NULL,
    data_vencimento_original  DATE,
    status_atual              VARCHAR(30) DEFAULT 'ATIVA'
                                  CHECK (status_atual IN ('ATIVA','SUSPENSA','EXTINTA','AJUIZADA','PARCELADA','CANCELADA')),
    rating_recuperabilidade   CHAR(1) CHECK (rating_recuperabilidade IN ('A','B','C','D')),
    is_segredo_justica        BOOLEAN DEFAULT false,
    created_at                TIMESTAMPTZ DEFAULT now(),
    updated_at                TIMESTAMPTZ DEFAULT now()
);

-- 6. CERTIDÃO DE DÍVIDA ATIVA (CDA)
CREATE TABLE IF NOT EXISTS public.obj_cda (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fda_id          UUID NOT NULL REFERENCES public.obj_fda(id) ON DELETE RESTRICT,
    organization_id UUID NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    numero_cda      VARCHAR(30) UNIQUE NOT NULL,
    status_emissao  VARCHAR(20) DEFAULT 'EMITIDA',
    snapshot_dados  JSONB NOT NULL,
    hash_autenticidade TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 7. PAGAMENTOS E ARRECADAÇÃO
CREATE TABLE IF NOT EXISTS public.obj_pagamento_da (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fda_id          UUID NOT NULL REFERENCES public.obj_fda(id) ON DELETE RESTRICT,
    organization_id UUID NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    valor_pago      NUMERIC(15,2) NOT NULL,
    data_pagamento  TIMESTAMPTZ DEFAULT now(),
    meio_pagamento  VARCHAR(20) CHECK (meio_pagamento IN ('PIX','BOLETO','TRANSFERENCIA')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 8. CADIM MUNICIPAL (Restrições do contribuinte)
-- fda_id é nullable: restrição pode existir mesmo após a FDA ser removida da visão
CREATE TABLE IF NOT EXISTS public.obj_cadim (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contribuinte_id  UUID NOT NULL,
    fda_id           UUID REFERENCES public.obj_fda(id) ON DELETE SET NULL,
    status_restricao VARCHAR(20) DEFAULT 'ATIVO'
                         CHECK (status_restricao IN ('ATIVO','REGULARIZADO')),
    data_inscricao   TIMESTAMPTZ DEFAULT now(),
    data_baixa       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- 9. FILAS DE RESILIÊNCIA (Outbox Pattern)
CREATE TABLE IF NOT EXISTS public.sys_event_outbox (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id  UUID NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    event_type       VARCHAR(50) NOT NULL,
    payload          JSONB NOT NULL,
    status           VARCHAR(20) DEFAULT 'PENDENTE',
    blockchain_sealed BOOLEAN DEFAULT false,
    created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.obj_integration_queue (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    servico_alvo  VARCHAR(20) NOT NULL,
    payload       JSONB NOT NULL,
    status        VARCHAR(20) DEFAULT 'PENDENTE',
    tentativas    INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 10. BLOCKCHAIN LEDGER (Imutabilidade fiscal via SHA-256 encadeado)
CREATE TABLE IF NOT EXISTS public.obj_blockchain_ledger (
    sequence_number    BIGSERIAL PRIMARY KEY,
    organization_id    UUID NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    object_slug        VARCHAR(50) NOT NULL,
    object_id          UUID NOT NULL,
    payload_hash       TEXT NOT NULL,
    previous_block_hash TEXT,
    current_block_hash TEXT NOT NULL,
    created_at         TIMESTAMPTZ DEFAULT now()
);

-- 11. CONFIG ENGINE (Metadados de UI — MetaGov Framework)
CREATE TABLE IF NOT EXISTS public.cfg_object_types (
    slug          VARCHAR(50) PRIMARY KEY,
    name          TEXT NOT NULL,
    storage_mode  VARCHAR(20) DEFAULT 'table',
    table_name    TEXT,
    configuration JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.cfg_object_properties (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_type_slug VARCHAR(50) REFERENCES public.cfg_object_types(slug) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    slug             TEXT NOT NULL,
    data_type        VARCHAR(50) NOT NULL,
    ui_component     VARCHAR(50) NOT NULL,
    is_required      BOOLEAN DEFAULT false,
    sort_order       INTEGER DEFAULT 0,
    configuration    JSONB DEFAULT '{}',
    UNIQUE(object_type_slug, slug)
);

-- 12. BRANDING (White Label por prefeitura)
CREATE TABLE IF NOT EXISTS public.sys_branding (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id      UUID UNIQUE NOT NULL REFERENCES public.sec_organization(id) ON DELETE RESTRICT,
    municipality_name    TEXT NOT NULL DEFAULT 'Prefeitura Municipal',
    municipality_logo_url TEXT,
    primary_color        TEXT DEFAULT '#4f46e5',
    secondary_color      TEXT DEFAULT '#1e293b',
    welcome_message      TEXT DEFAULT 'Bem-vindo ao Sistema de Dívida Ativa',
    is_active            BOOLEAN DEFAULT true,
    created_at           TIMESTAMPTZ DEFAULT now(),
    updated_at           TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- ÍNDICES
-- =============================================================================

-- FDA
CREATE INDEX IF NOT EXISTS idx_fda_organization  ON public.obj_fda(organization_id);
CREATE INDEX IF NOT EXISTS idx_fda_documento     ON public.obj_fda(documento_devedor);
CREATE INDEX IF NOT EXISTS idx_fda_status        ON public.obj_fda(status_atual);
CREATE INDEX IF NOT EXISTS idx_fda_created_at    ON public.obj_fda(created_at);

-- CDA
CREATE INDEX IF NOT EXISTS idx_cda_fda_id        ON public.obj_cda(fda_id);
CREATE INDEX IF NOT EXISTS idx_cda_organization  ON public.obj_cda(organization_id);

-- Pagamentos
CREATE INDEX IF NOT EXISTS idx_pagamento_fda_id      ON public.obj_pagamento_da(fda_id);
CREATE INDEX IF NOT EXISTS idx_pagamento_organization ON public.obj_pagamento_da(organization_id);

-- Outbox
CREATE INDEX IF NOT EXISTS idx_outbox_status      ON public.sys_event_outbox(status);
CREATE INDEX IF NOT EXISTS idx_outbox_organization ON public.sys_event_outbox(organization_id);

-- Blockchain
CREATE INDEX IF NOT EXISTS idx_blockchain_org    ON public.obj_blockchain_ledger(organization_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_blockchain_object ON public.obj_blockchain_ledger(object_slug, object_id);

-- Auditoria
CREATE INDEX IF NOT EXISTS idx_audit_log_organization ON public.sec_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at   ON public.sec_audit_log(created_at);
