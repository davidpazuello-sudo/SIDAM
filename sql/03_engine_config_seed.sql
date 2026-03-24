-- =============================================================================
-- SIDAM ENGINE CONFIG: STRATEGIC FILTERS SEED
-- Descrição: Configuração de filtros de alta performance para Secretarias.
-- =============================================================================

BEGIN;

-- 1. CONFIGURAÇÃO DA TAB DE ACOMPANHAMENTO DA SECRETARIA
-- -----------------------------------------------------------------------------
-- Nota: O campo 'configuration' da tabela sys_tabs (ou similar na engine) 
-- deve conter o JSON de filtros estratégicos.

UPDATE public.sys_object_types 
SET configuration = jsonb_set(
    COALESCE(configuration, '{}'::jsonb), 
    '{ui_metadata, tab_acompanhamento_secretaria}', 
    '{
      "tab_slug": "tab_acompanhamento_secretaria",
      "filters": [
        { "slug": "documento", "label": "CPF/CNPJ", "type": "mask", "props": { "mask": "000.000.000-00" } },
        { "slug": "status_triagem", "label": "Status", "type": "multi-select", "options": ["RASCUNHO", "EM_TRIAGEM", "ATIVA", "QUARENTENA", "PENDENTE"] },
        { "slug": "score_gigo", "label": "Qualidade do Dado", "type": "range", "props": { "min": 0, "max": 100 } },
        { "slug": "valor_total", "label": "Valor Acima de", "type": "currency_min" },
        { "slug": "aptos_envio", "label": "Aptos para Envio", "type": "smart", "description": "GIGO 100 + Valor > 1000 + Anexo PDF" }
      ],
      "default_filter": { "organization_id": "user.org_id" }
    }'::jsonb
)
WHERE slug = 'fda';

COMMIT;
