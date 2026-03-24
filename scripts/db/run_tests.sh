#!/usr/bin/env bash
set -euo pipefail

DB_URL="${DATABASE_URL:?DATABASE_URL is required}"

TESTS=(
  "supabase/tests/01_rls_access_matrix.sql"
  "supabase/tests/02_data_integrity_and_audit.sql"
)

echo "==> Running SQL test suite"
for file in "${TESTS[@]}"; do
  echo "--> $file"
  psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$file"
done

echo "==> SQL tests finished successfully"
