-- SIDAM - Fase 1: Core Schema
-- Objetivo: Criar a estrutura vital do sistema

-- Extensões Necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Estrutura de Organizações (Multi-tenancy)
CREATE TABLE public.sec_organization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ficha Cadastral da Dívida Ativa (FDA)
CREATE TABLE public.obj_fda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.sec_organization(id),
    numero_inscricao VARCHAR(30) UNIQUE NOT NULL,
    documento_devedor VARCHAR(18) NOT NULL,
    devedor_nome TEXT NOT NULL,
    valor_principal_inscrito NUMERIC(15,2) NOT NULL,
    status_atual VARCHAR(30) DEFAULT 'ATIVA' 
        CHECK (status_atual IN ('ATIVA', 'SUSPENSA', 'EXTINTA', 'AJUIZADA', 'PARCELADA', 'CANCELADA')),
    rating_recuperabilidade CHAR(1) CHECK (rating_recuperabilidade IN ('A', 'B', 'C', 'D')),
    is_segredo_justica BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Certidão de Dívida Ativa (CDA)
CREATE TABLE public.obj_cda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fda_id UUID NOT NULL REFERENCES public.obj_fda(id),
    organization_id UUID NOT NULL REFERENCES public.sec_organization(id),
    numero_cda VARCHAR(30) UNIQUE NOT NULL,
    status_emissao VARCHAR(20) DEFAULT 'EMITIDA',
    snapshot_dados JSONB NOT NULL,
    hash_autenticidade TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Pagamentos e Arrecadação
CREATE TABLE public.obj_pagamento_da (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fda_id UUID NOT NULL REFERENCES public.obj_fda(id),
    organization_id UUID NOT NULL REFERENCES public.sec_organization(id),
    valor_pago NUMERIC(15,2) NOT NULL,
    data_pagamento TIMESTAMPTZ DEFAULT now(),
    meio_pagamento VARCHAR(20) CHECK (meio_pagamento IN ('PIX', 'BOLETO', 'TRANSFERENCIA')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CADIM Municipal (Restrições)
CREATE TABLE public.obj_cadim (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contribuinte_id UUID NOT NULL,
    fda_id UUID REFERENCES public.obj_fda(id),
    status_restricao VARCHAR(20) DEFAULT 'ATIVO' CHECK (status_restricao IN ('ATIVO', 'REGULARIZADO')),
    data_inscricao TIMESTAMPTZ DEFAULT now(),
    data_baixa TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Filas de Resiliência (Outbox e Integração)
CREATE TABLE public.sys_event_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.sec_organization(id),
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    blockchain_sealed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.obj_integration_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    servico_alvo VARCHAR(20) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    tentativas INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Blockchain Ledger (Imutabilidade)
CREATE TABLE public.obj_blockchain_ledger (
    sequence_number BIGSERIAL PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.sec_organization(id),
    object_slug VARCHAR(50) NOT NULL,
    object_id UUID NOT NULL,
    payload_hash TEXT NOT NULL,
    previous_block_hash TEXT,
    current_block_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Config Engine (Metadados da Interface)
CREATE TABLE public.cfg_object_types (
    slug VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    storage_mode VARCHAR(20) DEFAULT 'table',
    table_name TEXT,
    configuration JSONB DEFAULT '{}'
);

CREATE TABLE public.cfg_object_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_type_slug VARCHAR(50) REFERENCES public.cfg_object_types(slug),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    ui_component VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    configuration JSONB DEFAULT '{}',
    UNIQUE(object_type_slug, slug)
);

-- Índices Iniciais
CREATE INDEX idx_fda_documento ON public.obj_fda(documento_devedor);
CREATE INDEX idx_fda_status ON public.obj_fda(status_atual);
CREATE INDEX idx_blockchain_org ON public.obj_blockchain_ledger(organization_id, sequence_number);
