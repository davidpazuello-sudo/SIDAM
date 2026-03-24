-- =============================================================================
-- SIDAM - Bootstrap: Organização Padrão, Super Admin e Seeds Iniciais
-- Depende de: 01_core_schema.sql, 07_integrations_layer.sql
-- ATENÇÃO: Execute apenas uma vez no ambiente alvo.
-- =============================================================================

BEGIN;

-- 1. ORGANIZAÇÃO PADRÃO (Prefeitura de Manaus)
-- -----------------------------------------------------------------------------
-- UUID fixo para permitir referências determinísticas em outros seeds.
INSERT INTO public.sec_organization (id, name, slug)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'Prefeitura de Manaus',
    'manaus'
)
ON CONFLICT (slug) DO NOTHING;

-- 2. BRANDING DA ORGANIZAÇÃO PADRÃO
-- -----------------------------------------------------------------------------
INSERT INTO public.sys_branding (organization_id, municipality_name, primary_color, secondary_color)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'Prefeitura de Manaus',
    '#4f46e5',
    '#1e293b'
)
ON CONFLICT (organization_id) DO NOTHING;

-- 3. SUPER ADMIN: David Pazuello
-- -----------------------------------------------------------------------------
INSERT INTO public.sec_user_profiles (email, profile_slug)
VALUES ('david.pazuello@sasi.com.br', 'super_dev')
ON CONFLICT (email) DO UPDATE SET
    profile_slug = 'super_dev',
    updated_at   = now();

-- 4. SEEDS DE INTEGRAÇÕES PADRÃO (esqueletos para configuração posterior)
-- -----------------------------------------------------------------------------
INSERT INTO public.sys_integrations (organization_id, slug, category, name, description, status)
VALUES
    ('a0000000-0000-0000-0000-000000000001'::UUID, 'gov_br',          'identidade',  'Gov.br (Login Único)',          'Autenticação segura via SSO do Governo Federal.',                 'INATIVO'),
    ('a0000000-0000-0000-0000-000000000001'::UUID, 'receita_federal', 'identidade',  'Receita Federal (CPF/CNPJ)',    'Validação cadastral e situação fiscal de contribuintes.',         'INATIVO'),
    ('a0000000-0000-0000-0000-000000000001'::UUID, 'pix_psp',         'arrecadacao', 'PIX Dinâmico (PSP)',            'Geração de QR Codes e baixa instantânea via Webhook.',           'INATIVO'),
    ('a0000000-0000-0000-0000-000000000001'::UUID, 'tjam_mni',        'juridico',    'TJAM (MNI/SAJ)',                'Ajuizamento eletrônico e recebimento de intimações do Tribunal.', 'INATIVO'),
    ('a0000000-0000-0000-0000-000000000001'::UUID, 'whatsapp_api',    'comunicacao', 'WhatsApp Business API',         'Notificações amigáveis e NegocioBot de parcelamento.',           'INATIVO'),
    ('a0000000-0000-0000-0000-000000000001'::UUID, 'tce_am',          'governanca',  'TCE-AM (Relatórios)',           'Envio automático de balanços e posição da dívida ativa.',         'INATIVO')
ON CONFLICT (organization_id, slug) DO NOTHING;

-- 5. AUDITORIA DO BOOTSTRAP
-- -----------------------------------------------------------------------------
INSERT INTO public.sec_audit_log (organization_id, severidade, evento_tipo, detalhes)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::UUID,
    'CRITICO',
    'BOOTSTRAP_ADMIN',
    '{"email": "david.pazuello@sasi.com.br", "role": "super_dev", "org_slug": "manaus"}'::JSONB
);

COMMIT;
