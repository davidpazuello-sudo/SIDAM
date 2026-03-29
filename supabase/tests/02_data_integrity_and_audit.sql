-- =============================================================================
-- SIDAM - Sprint 3 Test Cases: Integridade de Dados e Auditoria de Status
-- =============================================================================

BEGIN;

-- Pré-condição: organização seed (Manaus)
-- id: a0000000-0000-0000-0000-000000000001

-- 1) Deve aceitar CPF válido
INSERT INTO public.obj_fda (
  organization_id,
  numero_inscricao,
  documento_devedor,
  devedor_nome,
  valor_principal_inscrito,
  status_atual
)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'INSC-S3-0001',
  '11144477735', -- CPF válido de teste
  'Contribuinte Teste',
  1200.50,
  'ATIVA'
);

-- 2) Deve rejeitar documento inválido (esperado: erro de CHECK)
-- INSERT INTO public.obj_fda (
--   organization_id,
--   numero_inscricao,
--   documento_devedor,
--   devedor_nome,
--   valor_principal_inscrito,
--   status_atual
-- ) VALUES (
--   'a0000000-0000-0000-0000-000000000001',
--   'INSC-S3-0002',
--   '12345678900',
--   'Doc Inválido',
--   999.99,
--   'ATIVA'
-- );

-- 3) Deve rejeitar pagamento <= 0 (esperado: erro de CHECK)
-- INSERT INTO public.obj_pagamento_da (fda_id, organization_id, valor_pago, meio_pagamento)
-- SELECT id, organization_id, 0, 'PIX'
-- FROM public.obj_fda
-- WHERE numero_inscricao = 'INSC-S3-0001';

-- 4) Deve registrar auditoria ao mudar status
UPDATE public.obj_fda
SET status_atual = 'EXTINTA', updated_at = now()
WHERE numero_inscricao = 'INSC-S3-0001';

SELECT entity, campo, valor_anterior, valor_novo
FROM public.sec_status_audit
WHERE entity = 'obj_fda'
  AND campo = 'status_atual'
ORDER BY changed_at DESC
LIMIT 5;

-- 5) Idempotência outbox: não duplicar evento de pagamento para mesmo pagamento_id
-- (Executar em fluxo real de pagamento e checar índice único)
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname = 'ux_outbox_pagamento_confirmado';

ROLLBACK;
