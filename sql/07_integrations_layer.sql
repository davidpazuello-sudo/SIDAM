-- =============================================================================
-- SIDAM INTEGRATION LAYER: CONFIGURATION & LOGS
-- Descrição: Tabelas para gerenciar as conexões externas do MetaGov.
-- =============================================================================

BEGIN;

-- 1. TABELA DE CONFIGURAÇÃO DE INTEGRAÇÕES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sys_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    slug TEXT NOT NULL, -- ex: 'tjam', 'pix_bb', 'whatsapp_evolution'
    category TEXT NOT NULL, -- 'identidade', 'arrecadacao', 'juridico', 'comunicacao', 'governança'
    name TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}', -- Credenciais, URLs, etc (Criptografado no App)
    status TEXT DEFAULT 'INATIVO', -- 'ATIVO', 'INATIVO', 'ERRO', 'MANUTENÇÃO'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    circuit_breaker_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(organization_id, slug)
);

-- 2. LOGS DE EXECUÇÃO DE INTEGRAÇÕES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sys_integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.sys_integrations(id),
    status TEXT NOT NULL, -- 'SUCESSO', 'FALHA', 'TIMEOUT'
    duration_ms INTEGER,
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. SEED DE INTEGRAÇÕES PADRÃO (MetaGov Blueprint)
-- -----------------------------------------------------------------------------
-- Inserindo os esqueletos das integrações vitais para a organização padrão.
-- Nota: O organization_id deve ser o da prefeitura/cliente.

INSERT INTO public.sys_integrations (organization_id, slug, category, name, description, status)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'gov_br', 'identidade', 'Gov.br (Login Único)', 'Autenticação segura via SSO do Governo Federal.', 'INATIVO'),
    ('00000000-0000-0000-0000-000000000000', 'receita_federal', 'identidade', 'Receita Federal (CPF/CNPJ)', 'Validação cadastral e situação fiscal de contribuintes.', 'INATIVO'),
    ('00000000-0000-0000-0000-000000000000', 'pix_psp', 'arrecadacao', 'PIX Dinâmico (PSP)', 'Geração de QR Codes e baixa instantânea via Webhook.', 'INATIVO'),
    ('00000000-0000-0000-0000-000000000000', 'tjam_mni', 'juridico', 'TJAM (MNI/SAJ)', 'Ajuizamento eletrônico e recebimento de intimações do Tribunal.', 'INATIVO'),
    ('00000000-0000-0000-0000-000000000000', 'whatsapp_api', 'comunicacao', 'WhatsApp Business API', 'Notificações amigáveis e NegocioBot de parcelamento.', 'INATIVO'),
    ('00000000-0000-0000-0000-000000000000', 'tce_am', 'governança', 'TCE-AM (Relatórios)', 'Envio automático de balanços e posição da dívida ativa.', 'INATIVO')
ON CONFLICT (organization_id, slug) DO NOTHING;

COMMIT;
