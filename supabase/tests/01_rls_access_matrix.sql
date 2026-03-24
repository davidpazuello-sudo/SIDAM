-- =============================================================================
-- SIDAM - Sprint 2 Test Cases: Matriz de Acesso RLS
-- Objetivo: validar cenários permitidos/negados por perfil/tenant
-- Execução sugerida: psql contra ambiente de teste com dados seedados
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Cenário A: adm_pgm deve consultar integrações de qualquer organização
-- -----------------------------------------------------------------------------
SELECT set_config(
  'request.jwt.claims',
  '{"role":"authenticated","email":"admin@sidam.local","user_metadata":{"profile_slug":"adm_pgm","organization_id":"a0000000-0000-0000-0000-000000000001"}}',
  true
);

-- Esperado: acesso permitido
SELECT id, slug, organization_id
FROM public.sys_integrations
LIMIT 5;

-- -----------------------------------------------------------------------------
-- Cenário B: usuário de secretaria só vê a própria organização
-- -----------------------------------------------------------------------------
SELECT set_config(
  'request.jwt.claims',
  '{"role":"authenticated","email":"sec@sidam.local","user_metadata":{"profile_slug":"apoio_adm","organization_id":"a0000000-0000-0000-0000-000000000001"}}',
  true
);

-- Esperado: somente linhas da organização no JWT
SELECT COUNT(*) AS total_fora_org
FROM public.sys_integrations
WHERE organization_id <> public.get_auth_org();

-- -----------------------------------------------------------------------------
-- Cenário C: contribuinte não deve acessar filas sistêmicas
-- -----------------------------------------------------------------------------
SELECT set_config(
  'request.jwt.claims',
  '{"role":"authenticated","email":"cidadao@sidam.local","user_metadata":{"profile_slug":"contribuinte","organization_id":"a0000000-0000-0000-0000-000000000001","cpf_cnpj":"00000000000"}}',
  true
);

-- Esperado: 0 linhas visíveis (ou erro de permissão em operação de escrita)
SELECT COUNT(*) AS queue_rows_visible
FROM public.obj_integration_queue;

-- -----------------------------------------------------------------------------
-- Cenário D: procurador_pgm deve acessar processos judiciais
-- -----------------------------------------------------------------------------
SELECT set_config(
  'request.jwt.claims',
  '{"role":"authenticated","email":"procurador@sidam.local","user_metadata":{"profile_slug":"procurador_pgm","organization_id":"a0000000-0000-0000-0000-000000000001"}}',
  true
);

-- Esperado: acesso permitido em leitura
SELECT id, cda_id, status
FROM public.jud_processes
LIMIT 5;

ROLLBACK;
