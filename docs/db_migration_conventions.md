# Convenções de Migração de Banco (SIDAM)

Este guia padroniza migrações SQL para reduzir risco operacional e permitir reexecução segura.

## 1) Idempotência obrigatória

- **Tabelas/índices/extensões:** usar `IF NOT EXISTS` sempre que suportado.
- **Policies/Triggers sem `IF NOT EXISTS`:** usar padrão seguro:
  - `DROP ... IF EXISTS`
  - `CREATE ...`
- **Views:** preferir `CREATE OR REPLACE VIEW`.
- **Funções:** preferir `CREATE OR REPLACE FUNCTION`.
- **Seeds:** usar `ON CONFLICT DO NOTHING` ou `ON CONFLICT DO UPDATE`.

## 2) Estrutura recomendada por arquivo

1. Cabeçalho com objetivo, dependências e ordem.
2. DDL (schema).
3. Segurança (RLS/policies/grants).
4. Dados iniciais (seeds) com upsert idempotente.
5. Índices.

## 3) Regras de segurança

- Sempre explicitar escopo de RLS em tabelas novas.
- Para funções `SECURITY DEFINER`, fixar `search_path` e revisar owner/grants.
- Não criar policy ampla sem justificativa e comentário.

## 4) Regras de qualidade

- Constraints de domínio devem existir para status e faixas válidas.
- Evitar lógica crítica apenas na aplicação quando puder ser garantida no banco.
- Triggers devem considerar reprocessamento/retry.

## 5) Checklist de revisão de PR (migrations)

- [ ] Migração reexecuta sem erro.
- [ ] Não quebra em ambiente já provisionado.
- [ ] Seeds são idempotentes.
- [ ] Tabela nova com RLS/policies quando necessário.
- [ ] Mudança com estratégia clara de rollback/hotfix.

## 6) Verificação mínima antes de merge

1. Rodar migrações em banco vazio.
2. Rodar migrações novamente no mesmo banco.
3. Validar que não há erro de policy/trigger duplicado.
4. Validar integridade básica (FKs, views, funções principais).
