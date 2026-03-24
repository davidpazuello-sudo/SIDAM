-- =============================================================================
-- SIDAM SECURITY LAYER: ADMIN BOOTSTRAP
-- Descrição: Garante privilégios de Super Admin para o usuário David Pazuello.
-- =============================================================================

BEGIN;

-- 1. CRIAÇÃO DA TABELA DE MAPEAMENTO DE PERFIS (Caso não exista no JWT)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sec_user_profiles (
    email TEXT PRIMARY KEY,
    profile_slug TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. VINCULAÇÃO DO USUÁRIO AO PERFIL SUPER_DEV
-- -----------------------------------------------------------------------------
INSERT INTO public.sec_user_profiles (email, profile_slug)
VALUES ('david.pazuello@sasi.com.br', 'super_dev')
ON CONFLICT (email) DO UPDATE SET 
    profile_slug = 'super_dev',
    updated_at = now();

-- 3. ATUALIZAÇÃO DA FUNÇÃO DE CAPTURA DE PERFIL
-- -----------------------------------------------------------------------------
-- Esta função agora é híbrida: tenta ler do JWT (Supabase Auth) 
-- e faz fallback para a tabela sec_user_profiles.

CREATE OR REPLACE FUNCTION public.get_auth_profile() 
RETURNS TEXT AS $$
DECLARE
    v_profile TEXT;
    v_email TEXT;
BEGIN
    -- Captura o email do JWT
    v_email := (auth.jwt() ->> 'email')::TEXT;

    -- 1. Tenta pegar do JWT metadata (padrão de claims do Supabase)
    v_profile := (auth.jwt() -> 'user_metadata' ->> 'profile_slug')::TEXT;
    
    -- 2. Se não estiver no JWT, busca na nossa tabela de mapeamento por email
    IF v_profile IS NULL AND v_email IS NOT NULL THEN
        SELECT profile_slug INTO v_profile 
        FROM public.sec_user_profiles 
        WHERE email = v_email;
    END IF;
    
    -- 3. Fallback final para 'contribuinte' caso nada seja encontrado
    RETURN COALESCE(v_profile, 'contribuinte');
END;
$$ LANGUAGE sql STABLE;

-- 4. AUDITORIA DO BOOTSTRAP
-- -----------------------------------------------------------------------------
INSERT INTO public.sec_audit_log (severidade, evento_tipo, detalhes)
VALUES ('CRITICO', 'BOOTSTRAP_ADMIN', '{"email": "david.pazuello@sasi.com.br", "role": "super_dev"}');

COMMIT;
