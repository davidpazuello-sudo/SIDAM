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
CREATE TRIGGER trg_blockchain_fda AFTER INSERT OR UPDATE ON public.obj_fda FOR EACH ROW EXECUTE FUNCTION public.fn_generate_blockchain_block();
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

CREATE TRIGGER trg_baixa_pagamento_safe
AFTER INSERT ON public.obj_pagamento_da
FOR EACH ROW EXECUTE FUNCTION public.fn_trigger_pagamento_safe();
