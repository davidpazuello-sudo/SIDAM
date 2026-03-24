-- =============================================================================
-- SIDAM INTELLIGENCE LAYER: TRIGGERS & AUTOMATION
-- Descrição: Automação de Baixas, Cálculo de Rating e Blockchain Fiscal.
-- Requisito: Extensão pgcrypto deve estar ativa.
-- =============================================================================

BEGIN;

-- 1. MOTOR DE OUTBOX (Resiliência)
-- -----------------------------------------------------------------------------
-- Função para registrar eventos de forma assíncrona, evitando o "Trigger Hell".

CREATE OR REPLACE FUNCTION public.fn_log_outbox_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.sys_event_outbox (event_type, payload, organization_id)
    VALUES (
        TG_ARGV[0], -- Tipo do evento passado no trigger
        to_jsonb(NEW), 
        NEW.organization_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 2. AUTOMAÇÃO DE BAIXA POR PAGAMENTO
-- -----------------------------------------------------------------------------
-- Quando um pagamento é inserido, a Ficha Cadastral (FDA) é extinta automaticamente.

CREATE OR REPLACE FUNCTION public.fn_process_payment_discharge()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Atualiza o status da dívida para EXTINTA
    UPDATE public.obj_fda 
    SET status_atual = 'EXTINTA', 
        updated_at = now() 
    WHERE id = NEW.fda_id;

    -- 2. Registra na timeline da FDA
    INSERT INTO public.obj_fda_eventos (fda_id, tipo_evento, descricao)
    VALUES (NEW.fda_id, 'PAGAMENTO_CONFIRMADO', 'Baixa automática via sistema de arrecadação.');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_baixa_automatica_pagamento
AFTER INSERT ON public.obj_pagamento_da
FOR EACH ROW EXECUTE FUNCTION public.fn_process_payment_discharge();


-- 3. MOTOR DE RATING PREDITIVO (A-D)
-- -----------------------------------------------------------------------------
-- Calcula a recuperabilidade da dívida antes de salvar a FDA.

CREATE OR REPLACE FUNCTION public.fn_compute_debt_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_idade_anos INTEGER;
BEGIN
    -- Lógica Simplificada de Scoring:
    -- 1. Idade da Dívida (Mais nova = melhor rating)
    v_idade_anos := EXTRACT(YEAR FROM age(now(), NEW.data_vencimento_original));
    
    IF v_idade_anos <= 2 THEN v_score := v_score + 50;
    ELSIF v_idade_anos <= 5 THEN v_score := v_score + 20;
    END IF;

    -- 2. Valor (Valores menores costumam ter maior liquidez no PIX)
    IF NEW.valor_principal_inscrito < 5000 THEN v_score := v_score + 30;
    END IF;

    -- 3. Atribuição da Letra
    NEW.rating_recuperabilidade := 
        CASE 
            WHEN v_score >= 70 THEN 'A'
            WHEN v_score >= 40 THEN 'B'
            WHEN v_score >= 20 THEN 'C'
            ELSE 'D'
        END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcula_rating_fda
BEFORE INSERT ON public.obj_fda
FOR EACH ROW EXECUTE FUNCTION public.fn_compute_debt_rating();


-- 4. MOTOR DE BLOCKCHAIN FISCAL (Imutabilidade)
-- -----------------------------------------------------------------------------
-- Gera o Hash SHA-256 encadeado para garantir que o dado não foi alterado via SQL manual.

CREATE OR REPLACE FUNCTION public.fn_blockchain_chaining()
RETURNS TRIGGER AS $$
DECLARE
    v_prev_hash TEXT;
    v_payload_hash TEXT;
BEGIN
    -- 1. Recupera o hash do bloco anterior para esta organização
    SELECT block_hash INTO v_prev_hash 
    FROM public.obj_blockchain_ledger 
    WHERE organization_id = NEW.organization_id 
    ORDER BY id DESC LIMIT 1;

    v_prev_hash := COALESCE(v_prev_hash, 'GENESIS');

    -- 2. Gera o hash do conteúdo atual (Payload)
    v_payload_hash := encode(digest(NEW::text, 'sha256'), 'hex');

    -- 3. Sela o novo bloco (Payload + Hash Anterior)
    INSERT INTO public.obj_blockchain_ledger (
        organization_id, 
        object_slug, 
        object_id, 
        payload_hash, 
        previous_block_hash, 
        block_hash
    ) VALUES (
        NEW.organization_id,
        TG_TABLE_NAME,
        NEW.id,
        v_payload_hash,
        v_prev_hash,
        encode(digest(v_payload_hash || v_prev_hash, 'sha256'), 'hex')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ativando Blockchain nas tabelas de Títulos e Fichas
CREATE TRIGGER trg_seal_fda AFTER INSERT OR UPDATE ON public.obj_fda FOR EACH ROW EXECUTE FUNCTION public.fn_blockchain_chaining();
CREATE TRIGGER trg_seal_cda AFTER INSERT OR UPDATE ON public.obj_cda FOR EACH ROW EXECUTE FUNCTION public.fn_blockchain_chaining();

COMMIT;
