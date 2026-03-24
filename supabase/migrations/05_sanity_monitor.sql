-- SIDAM - Fase 1: Sanity Monitor Views
-- Objetivo: Detectar inconsistências financeiras, jurídicas e operacionais

-- 1. Monitor de Sanidade Financeira (Pagamentos vs Baixas)
CREATE OR REPLACE VIEW public.monitor_sanidade_financeira AS
SELECT 
    p.id AS pagamento_id,
    f.numero_inscricao,
    p.valor_pago,
    f.status_atual AS status_na_fda,
    CASE 
        WHEN f.status_atual = 'ATIVA' THEN '🔴 CRÍTICO: Pagamento sem baixa'
        WHEN f.status_atual = 'EXTINTA' THEN '🟢 OK: Baixa processada'
        ELSE '🟡 VERIFICAR: Status inconsistente'
    END AS diagnostico
FROM public.obj_pagamento_da p
JOIN public.obj_fda f ON p.fda_id = f.id
WHERE f.status_atual = 'ATIVA' OR p.created_at > now() - INTERVAL '24 hours';

-- 2. Monitor de Sanidade Jurídica (Prevenção de Dano Moral)
CREATE OR REPLACE VIEW public.monitor_sanidade_juridica AS
SELECT 
    c.id AS registro_id,
    'CADIM' AS modulo,
    f.numero_inscricao,
    '🔴 CRÍTICO: Devedor regularizado ainda restrito no CADIM' AS diagnostico
FROM public.obj_cadim c
JOIN public.obj_fda f ON c.fda_id = f.id
WHERE c.status_restricao = 'ATIVO' 
AND f.status_atual IN ('EXTINTA', 'PARCELADA', 'SUSPENSA');

-- 3. Monitor de Integridade Blockchain
CREATE OR REPLACE VIEW public.monitor_blockchain_integridade AS
WITH verificacao AS (
    SELECT 
        sequence_number,
        current_block_hash,
        LAG(current_block_hash) OVER (PARTITION BY organization_id ORDER BY sequence_number) as hash_anterior_calculado,
        previous_block_hash
    FROM public.obj_blockchain_ledger
)
SELECT 
    sequence_number,
    CASE 
        WHEN sequence_number = 1 THEN '🟢 GÊNESE'
        WHEN previous_block_hash = hash_anterior_calculado THEN '🟢 ÍNTEGRO'
        ELSE '🔴 VIOLADO: Quebra de corrente detectada!'
    END AS status_integridade
FROM verificacao
WHERE previous_block_hash != hash_anterior_calculado;
