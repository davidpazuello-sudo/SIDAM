#!/usr/bin/env bash
set -euo pipefail

DB_URL="${DATABASE_URL:?DATABASE_URL is required}"

MIGRATIONS=(
  "supabase/migrations/01_core_schema.sql"
  "supabase/migrations/02_security_rls.sql"
  "supabase/migrations/03_config_engine.sql"
  "supabase/migrations/04_triggers_logic.sql"
  "supabase/migrations/05_sanity_monitor.sql"
  "supabase/migrations/07_integrations_layer.sql"
  "supabase/migrations/06_bootstrap_admin.sql"
  "supabase/migrations/08_pix_revenue_layer.sql"
  "supabase/migrations/09_judicial_layer.sql"
  "supabase/migrations/10_security_rls_expansion.sql"
  "supabase/migrations/11_sprint3_data_integrity.sql"
  "supabase/migrations/12_sprint5_observability_ops.sql"
  "supabase/migrations/13_sprint6_governance_scale.sql"
)

# CI bootstrap: create mock Supabase auth schema so RLS policies compile in plain PostgreSQL
echo "==> Bootstrapping mock auth schema for CI"
psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT '00000000-0000-0000-0000-000000000000'::uuid $$;
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT 'anon'::text $$;
SQL

echo "==> Applying migrations in deterministic order"
for file in "${MIGRATIONS[@]}"; do
  echo "--> $file"
  psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$file"
done

echo "==> Migration pass finished successfully"
