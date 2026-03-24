-- SIDAM - Fase 1: Config Engine Seed
-- Objetivo: Definir como a FDA deve ser renderizada na tela

-- 1. Registrar o Tipo de Objeto FDA
INSERT INTO public.cfg_object_types (slug, name, storage_mode, table_name)
VALUES ('fda', 'Ficha Cadastral da Dívida Ativa', 'table', 'obj_fda');

-- 2. Definir as Propriedades da FDA para a Interface
INSERT INTO public.cfg_object_properties 
(object_type_slug, name, slug, data_type, ui_component, is_required, sort_order)
VALUES 
('fda', 'Nº Inscrição', 'numero_inscricao', 'string', 'TextInput', true, 1),
('fda', 'CPF/CNPJ Devedor', 'documento_devedor', 'string', 'MaskedInput', true, 2),
('fda', 'Nome do Devedor', 'devedor_nome', 'string', 'TextInput', true, 3),
('fda', 'Valor Principal', 'valor_principal_inscrito', 'decimal', 'CurrencyInput', true, 4),
('fda', 'Status Atual', 'status_atual', 'string', 'StatusBadge', true, 5),
('fda', 'Rating', 'rating_recuperabilidade', 'string', 'RatingBadge', false, 6);
