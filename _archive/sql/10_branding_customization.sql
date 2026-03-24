-- =============================================================================
-- SIDAM SYSTEM LAYER: BRANDING & CUSTOMIZATION
-- Descrição: Gestão de identidade visual para diferentes prefeituras (White Label).
-- =============================================================================

BEGIN;

-- 1. TABELA DE CONFIGURAÇÃO DE BRANDING
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sys_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID UNIQUE NOT NULL,
    municipality_name TEXT NOT NULL DEFAULT 'Prefeitura Municipal',
    municipality_logo_url TEXT, -- URL da logo ou Base64
    primary_color TEXT DEFAULT '#4f46e5', -- Indigo-600 default
    secondary_color TEXT DEFAULT '#1e293b', -- Slate-800 default
    welcome_message TEXT DEFAULT 'Bem-vindo ao Sistema de Dívida Ativa',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. INSERIR CONFIGURAÇÃO PADRÃO (SEED)
-- -----------------------------------------------------------------------------
INSERT INTO public.sys_branding (organization_id, municipality_name, primary_color)
VALUES ('org1', 'Prefeitura de Manaus', '#4f46e5')
ON CONFLICT (organization_id) DO NOTHING;

COMMIT;
