# 🚫 Manifesto de Restrição Técnica - Projeto SIDAM

Você deve seguir estritamente estas regras. Qualquer desvio resultará em erro de arquitetura:

1. **Linguagem:** EXCLUSIVAMENTE TypeScript. Proibido arquivos .js.
2. **Estilização:** EXCLUSIVAMENTE Tailwind CSS. Proibido CSS puro ou estilos inline.
3. **UI:** EXCLUSIVAMENTE Shadcn/UI. Proibido Material UI ou Ant Design.
4. **Banco de Dados:** EXCLUSIVAMENTE PostgreSQL (Supabase). Proibido NoSQL ou outros SQLs.
5. **Persistência:** Proibido DELETE físico. Use apenas Soft Delete (status='CANCELADO').
6. **Backend:** Toda lógica deve estar em Supabase Edge Functions ou Database Triggers.
7. **Dinamicidade:** NÃO crie páginas estáticas para tabelas. Use o motor que lê `cfg_object_properties`.
