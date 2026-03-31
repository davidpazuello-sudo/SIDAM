-- =============================================================================
-- SIDAM - CI compatibility: Supabase auth schema stub
-- Purpose: allow migrations that reference auth.jwt() to run on bare PostgreSQL
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS auth;

-- In Supabase this is provided by the auth extension. For CI/local bare PostgreSQL,
-- expose a compatible function that reads JWT claims from request.jwt.claims when set.
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true), '{}')::jsonb;
$$;
