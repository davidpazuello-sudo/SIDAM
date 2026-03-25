-- SIDAM - Fase 1: Triggers & Logic
-- Objetivo: Implementar a inteligência reativa do banco de dados

-- 1. Motor de Blockchain (Hashing Encadeado)
CREATE OR REPLACE FUNCTION public.fn_generate_blockchain_block()
RETURNS TRIGGER AS $$
DECLARE
    v_prev_hash TEXT;
    v_payload_hash TEXT;
    v_current_block_hash TEXT;
BEGIN
    -- Recuperar o Hash do último bloco da organização
    SELECT current_block_hash INTO v_prev_hash 
    FROM public.obj_blockchain_ledger 
    WHERE organization_id = NEW.organization_id 
    ORDER BY sequence_number DESC LIMIT 1;

    -- Gerar Hash do Payload atual
    v_payload_hash := encode(digest(NEW::text, 'sha256'), 'hex');

    -- Gerar o Hash do Bloco Atual (Payload + Hash Anterior)
    v_current_block_hash := encode(digest(v_payload_hash || COALESCE(v_prev_hash, 'GENESIS'), 'sha256'), 'hex');

    -- Inserir no Ledger
    INSERT INTO public.obj_blockchain_ledger (
        organization_id, object_slug, object_id, 
        payload_hash, previous_block_hash, current_block_hash
    ) VALUES (
        NEW.organization_id, TG_TABLE_NAME, NEW.id,
        v_payload_hash, v_prev_hash, v_current_block_hash
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar Blockchain na FDA e CDA
DROP TRIGGER IF EXISTS trg_blockchain_fda ON public.obj_fda;
CREATE TRIGGER trg_blockchain_fda AFTER INSERT OR UPDATE ON public.obj_fda FOR EACH ROW EXECUTE FUNCTION public.fn_generate_blockchain_block();
DROP TRIGGER IF EXISTS trg_blockchain_cda ON public.obj_cda;
CREATE TRIGGER trg_blockchain_cda AFTER INSERT OR UPDATE ON public.obj_cda FOR EACH ROW EXECUTE FUNCTION public.fn_generate_blockchain_block();

-- 2. Motor de Pagamento Seguro (Outbox Pattern)
CREATE OR REPLACE FUNCTION public.fn_trigger_pagamento_safe()
RETURNS TRIGGER AS $$
BEGIN
    -- AÇÃO CRÍTICA: Baixar a Dívida
    UPDATE public.obj_fda 
    SET status_atual = 'EXTINTA', updated_at = now() 
    WHERE id = NEW.fda_id;

    -- AÇÃO CRÍTICA: Registrar na Outbox para processamento assíncrono (Contabilidade, WhatsApp, etc)
    INSERT INTO public.sys_event_outbox (organization_id, event_type, payload)
    VALUES (
        NEW.organization_id,
        'PAGAMENTO_CONFIRMADO', 
        jsonb_build_object(
            'pagamento_id', NEW.id,
            'fda_id', NEW.fda_id,
            'valor', NEW.valor_pago
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_baixa_pagamento_safe ON public.obj_pagamento_da;
CREATE TRIGGER trg_baixa_pagamento_safe
AFTER INSERT ON public.obj_pagamento_da
FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_pagamento_safe();

-- 3. MOTOR DE RATING PREDITIVO (A-D)
-- -----------------------------------------------------------------------------
-- Calcula automaticamente a recuperabilidade da dívida antes de inserir a FDA.
-- Usa data_vencimento_original se preenchida; caso contrário usa a data atual.

CREATE OR REPLACE FUNCTION public.fn_compute_debt_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_score      INTEGER := 0;
    v_idade_anos INTEGER;
    v_data_ref   DATE;
BEGIN
    -- Referência de data: vencimento original ou data de inscrição (hoje)
    v_data_ref   := COALESCE(NEW.data_vencimento_original, now()::DATE);
    v_idade_anos := EXTRACT(YEAR FROM age(now(), v_data_ref))::INTEGER;

    -- Scoring por idade da dívida (mais nova = melhor recuperabilidade)
    IF v_idade_anos <= 2 THEN
        v_score := v_score + 50;
    ELSIF v_idade_anos <= 5 THEN
        v_score := v_score + 20;
    END IF;

    -- Scoring por valor (valores menores têm maior liquidez via PIX)
    IF NEW.valor_principal_inscrito < 5000 THEN
        v_score := v_score + 30;
    END IF;

    -- Atribuição da letra de rating
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

DROP TRIGGER IF EXISTS trg_calcula_rating_fda ON public.obj_fda;
CREATE TRIGGER trg_calcula_rating_fda
BEFORE INSERT ON public.obj_fda
FOR EACH ROW EXECUTE FUNCTION public.fn_compute_debt_rating();
