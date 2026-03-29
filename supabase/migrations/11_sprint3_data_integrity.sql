-- =============================================================================
-- SIDAM - Sprint 3: Qualidade de Dados + Integridade + Auditoria de Status
-- Depende de: 01_core_schema.sql, 04_triggers_logic.sql, 08_pix_revenue_layer.sql, 10_security_rls_expansion.sql
-- =============================================================================

-- 1) Função utilitária para validação de CPF/CNPJ (formato + dígitos verificadores)
CREATE OR REPLACE FUNCTION public.fn_is_valid_cpf_cnpj(p_doc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_doc   TEXT;
    v_len   INT;
    i       INT;
    sum1    INT;
    sum2    INT;
    dig1    INT;
    dig2    INT;
BEGIN
    IF p_doc IS NULL THEN
        RETURN false;
    END IF;

    v_doc := regexp_replace(p_doc, '[^0-9]', '', 'g');
    v_len := length(v_doc);

    IF v_len NOT IN (11, 14) THEN
        RETURN false;
    END IF;

    -- Rejeita sequências repetidas (000..., 111..., etc.)
    IF v_doc ~ '^(\d)\1+$' THEN
        RETURN false;
    END IF;

    IF v_len = 11 THEN
        -- CPF
        sum1 := 0;
        FOR i IN 1..9 LOOP
            sum1 := sum1 + (substring(v_doc, i, 1)::INT * (11 - i));
        END LOOP;
        dig1 := 11 - (sum1 % 11);
        IF dig1 >= 10 THEN dig1 := 0; END IF;

        sum2 := 0;
        FOR i IN 1..10 LOOP
            sum2 := sum2 + (substring(v_doc, i, 1)::INT * (12 - i));
        END LOOP;
        dig2 := 11 - (sum2 % 11);
        IF dig2 >= 10 THEN dig2 := 0; END IF;

        RETURN dig1 = substring(v_doc, 10, 1)::INT
           AND dig2 = substring(v_doc, 11, 1)::INT;
    END IF;

    -- CNPJ
    sum1 := 0;
    FOR i IN 1..12 LOOP
        sum1 := sum1 + (substring(v_doc, i, 1)::INT * (ARRAY[5,4,3,2,9,8,7,6,5,4,3,2])[i]);
    END LOOP;
    dig1 := 11 - (sum1 % 11);
    IF dig1 >= 10 THEN dig1 := 0; END IF;

    sum2 := 0;
    FOR i IN 1..13 LOOP
        sum2 := sum2 + (substring(v_doc, i, 1)::INT * (ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2])[i]);
    END LOOP;
    dig2 := 11 - (sum2 % 11);
    IF dig2 >= 10 THEN dig2 := 0; END IF;

    RETURN dig1 = substring(v_doc, 13, 1)::INT
       AND dig2 = substring(v_doc, 14, 1)::INT;
END;
$$;

-- 2) Constraints de consistência e domínio
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_obj_fda_valor_positivo'
    ) THEN
        ALTER TABLE public.obj_fda
        ADD CONSTRAINT chk_obj_fda_valor_positivo
        CHECK (valor_principal_inscrito > 0);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_obj_fda_documento_valido'
    ) THEN
        ALTER TABLE public.obj_fda
        ADD CONSTRAINT chk_obj_fda_documento_valido
        CHECK (public.fn_is_valid_cpf_cnpj(documento_devedor));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_pagamento_valor_positivo'
    ) THEN
        ALTER TABLE public.obj_pagamento_da
        ADD CONSTRAINT chk_pagamento_valor_positivo
        CHECK (valor_pago > 0);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_cadim_baixa_coerente'
    ) THEN
        ALTER TABLE public.obj_cadim
        ADD CONSTRAINT chk_cadim_baixa_coerente
        CHECK (data_baixa IS NULL OR data_baixa >= data_inscricao);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_rev_pix_valor_positivo'
    ) THEN
        ALTER TABLE public.rev_pix_payments
        ADD CONSTRAINT chk_rev_pix_valor_positivo
        CHECK (valor > 0);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_jud_batch_progress'
    ) THEN
        ALTER TABLE public.jud_filing_batches
        ADD CONSTRAINT chk_jud_batch_progress
        CHECK (total_items >= 0 AND processed_items >= 0 AND processed_items <= total_items);
    END IF;
END $$;

-- 3) Idempotência operacional para outbox de pagamento
-- Evita eventos duplicados de PAGAMENTO_CONFIRMADO para o mesmo pagamento_id
CREATE UNIQUE INDEX IF NOT EXISTS ux_outbox_pagamento_confirmado
ON public.sys_event_outbox (event_type, ((payload ->> 'pagamento_id')))
WHERE event_type = 'PAGAMENTO_CONFIRMADO';

CREATE OR REPLACE FUNCTION public.fn_trigger_pagamento_safe()
RETURNS TRIGGER AS $$
BEGIN
    -- AÇÃO CRÍTICA: Baixar a Dívida
    UPDATE public.obj_fda
    SET status_atual = 'EXTINTA', updated_at = now()
    WHERE id = NEW.fda_id;

    -- AÇÃO CRÍTICA: Registrar na Outbox sem duplicidade lógica
    IF NOT EXISTS (
        SELECT 1
        FROM public.sys_event_outbox o
        WHERE o.event_type = 'PAGAMENTO_CONFIRMADO'
          AND o.payload ->> 'pagamento_id' = NEW.id::TEXT
    ) THEN
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
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Auditoria de mudanças críticas de status na FDA
CREATE TABLE IF NOT EXISTS public.sec_status_audit (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id  UUID REFERENCES public.sec_organization(id) ON DELETE SET NULL,
    entity           TEXT NOT NULL,
    entity_id        UUID NOT NULL,
    campo            TEXT NOT NULL,
    valor_anterior   TEXT,
    valor_novo       TEXT,
    changed_by       UUID DEFAULT auth.uid(),
    changed_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_audit_entity ON public.sec_status_audit(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_audit_org ON public.sec_status_audit(organization_id, changed_at);

ALTER TABLE public.sec_status_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "StatusAudit_Read_Admin" ON public.sec_status_audit;
CREATE POLICY "StatusAudit_Read_Admin" ON public.sec_status_audit
FOR SELECT TO authenticated
USING (public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'super_dev'));

DROP POLICY IF EXISTS "StatusAudit_Insert_System" ON public.sec_status_audit;
CREATE POLICY "StatusAudit_Insert_System" ON public.sec_status_audit
FOR INSERT TO authenticated
WITH CHECK (
    public.get_auth_profile() IN ('adm_pgm', 'procurador_pgm', 'super_dev')
    OR organization_id = public.get_auth_org()
);

CREATE OR REPLACE FUNCTION public.fn_audit_fda_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_atual IS DISTINCT FROM OLD.status_atual THEN
        INSERT INTO public.sec_status_audit (
            organization_id,
            entity,
            entity_id,
            campo,
            valor_anterior,
            valor_novo
        ) VALUES (
            NEW.organization_id,
            'obj_fda',
            NEW.id,
            'status_atual',
            OLD.status_atual,
            NEW.status_atual
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_fda_status_change ON public.obj_fda;
CREATE TRIGGER trg_audit_fda_status_change
AFTER UPDATE ON public.obj_fda
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_fda_status_change();
