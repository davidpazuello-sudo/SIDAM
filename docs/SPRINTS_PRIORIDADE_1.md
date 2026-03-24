# 🚨 SIDAM — Sprints de Prioridade 1

Documento operacional com os sprints corretivos P1-A a P1-D (gerado em 24/03/2026), com ordem de execução:

1. P1-A — Executar 13 migrações no Supabase
2. P1-B — Conectar Frontend ao Supabase (client + services + tipos)
3. P1-C — Autenticação (login + rota protegida)
4. P1-D — CI/CD (workflows verdes)

## Status nesta branch

- [ ] **P1-A (manual no dashboard Supabase):** pendente de execução fora do repositório.
- [x] **P1-B (código):** `supabaseClient`, `organizationService`, `fdaService`, `.env.example`, `database.ts`.
- [x] **P1-C (código):** `authService`, `AuthContext`, `LoginPage`, `ProtectedRoute`, integração no `main.tsx`, logout no `App.tsx`.
- [x] **P1-D (código):** workflow `.github/workflows/ci.yml` e `.github/workflows/db-validate.yml`.

## Observação de segurança

A chave `GEMINI_API_KEY` deve ficar somente em **GitHub Secrets** e **variáveis de ambiente**. Não versionar segredos em arquivos do projeto.
