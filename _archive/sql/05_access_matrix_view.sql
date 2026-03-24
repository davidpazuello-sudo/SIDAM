-- =============================================================================
-- SIDAM SECURITY LAYER: ACCESS MATRIX VIEW
-- Descrição: View para facilitar a leitura da Matriz de Acesso pelo Next.js
-- =============================================================================

-- View para facilitar a leitura da Matriz de Acesso pelo Next.js
CREATE OR REPLACE VIEW public.vw_matriz_acesso_resumo AS
SELECT 
    p.name AS perfil,
    p.slug AS perfil_slug,
    m.name AS modulo,
    m.slug AS modulo_slug,
    CASE WHEN m.required_profile = p.slug OR p.slug = 'super_dev' THEN true ELSE false END AS tem_acesso,
    (SELECT count(*) FROM sec_policy pol WHERE pol.resource = m.slug) AS qtd_politicas
FROM sec_profile p
CROSS JOIN ui_modules m
ORDER BY p.sort_order, m.sort_order;
