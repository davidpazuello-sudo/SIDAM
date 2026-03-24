# Análise de Maturidade para Criação/Evolução do Banco de Dados (SIDAM)

**Data da análise:** 2026-03-24  
**Escopo analisado:** `supabase/migrations/*.sql`, `README.md`

## Resumo executivo

Com base nas migrações atuais do SIDAM, o sistema apresenta **maturidade intermediária para avançada (Nível 3 de 5, com elementos de Nível 4)** para criação do banco de dados.

- **Pontos fortes:** modelagem inicial consistente, multi-tenant explícito, uso de constraints, índice, RLS/ABAC, gatilhos de automação e camadas de domínio (PIX, judicial, integrações).
- **Gaps críticos para produção robusta:** governança de migrações (idempotência parcial, `IF NOT EXISTS` em políticas ausente), ausência de estratégia formal de versionamento reversível, pouca cobertura de observabilidade operacional (métricas de performance/replicação), e falta de evidências de testes automatizados de banco (RLS/trigger/integridade).

## Escala de maturidade usada

- **Nível 1 — Inicial:** scripts ad-hoc sem padrão.
- **Nível 2 — Repetível:** há padrão de scripts e ordem de execução.
- **Nível 3 — Definido:** arquitetura de schema e segurança definida e consistente.
- **Nível 4 — Gerenciado:** métricas, testes automatizados e operação previsível.
- **Nível 5 — Otimizado:** melhoria contínua com SLO/SLI, automação completa e hardening contínuo.

## Diagnóstico por dimensão

### 1) Modelagem de dados (Nível 4)

**Evidências positivas**
- Entidades centrais e satélites bem separadas (`obj_fda`, `obj_cda`, `obj_pagamento_da`, `sys_event_outbox`, `obj_blockchain_ledger`, etc.).
- Integridade relacional com FKs e ações de deleção controladas (`RESTRICT`, `SET NULL`).
- Domínio protegido com `CHECK` para status e enumerações textuais.
- Índices base para principais padrões de acesso.

**Riscos / melhorias**
- Falta de constraints adicionais de consistência temporal/financeira (ex.: `valor_pago > 0`, coerência `data_baixa >= data_inscricao`).
- Alguns campos de negócio sensíveis sem validação semântica (ex.: formato de CPF/CNPJ apenas por tamanho).

### 2) Segurança e isolamento multi-tenant (Nível 3)

**Evidências positivas**
- RLS habilitado em tabelas críticas.
- Funções auxiliares para perfil, organização e documento do usuário.
- Políticas por perfil e por tenant, incluindo cenários de contribuinte e admin.

**Riscos / melhorias**
- Políticas não usam `IF NOT EXISTS` (pode quebrar reexecução em ambientes já provisionados).
- Uso de `SECURITY DEFINER` exige revisão de privilégios/search_path para evitar riscos de escalonamento.
- Cobertura de RLS não está explícita para todas as tabelas novas de integrações, PIX e judicial.

### 3) Automação e lógica de negócio no banco (Nível 3)

**Evidências positivas**
- Triggers para blockchain, baixa de pagamento com outbox e cálculo de rating.
- Separação por camadas (core, security, config, trigger, monitor, integrações).

**Riscos / melhorias**
- Triggers sem controle explícito de idempotência por evento podem gerar duplicidade em cenários de retry.
- Cálculo de hash com `NEW::text` pode ser sensível a serialização/ordem de campos em cenários complexos.
- Ausência de estratégia documentada para dead-letter/reprocessamento da outbox.

### 4) Operação e observabilidade (Nível 2)

**Evidências positivas**
- Views de monitoramento de sanidade financeira, jurídica e integridade de blockchain.

**Riscos / melhorias**
- Falta de métricas operacionais de banco (bloat, locks, slow queries, crescimento por tabela).
- Falta de jobs/schedules explícitos para housekeeping (retenção de logs, particionamento, arquivamento).
- Ausência de SLOs de replicação e RTO/RPO documentados.

### 5) Governança de migrações e DevOps de dados (Nível 2)

**Evidências positivas**
- Ordem numérica de migrações coerente e com dependências declaradas em comentários.
- Uso de `CREATE ... IF NOT EXISTS` em boa parte das tabelas/índices.

**Riscos / melhorias**
- Seeds em migração (`06_bootstrap_admin.sql`) com dados de ambiente podem dificultar promoção entre ambientes.
- Ausência de rollback strategy por migração.
- Ausência de testes automatizados (ex.: pgTAP) para validar RLS, constraints e funções em CI.

## Nível de maturidade consolidado

**Resultado final: Nível 3/5 (Definido), tendendo ao Nível 4 em modelagem e segurança.**

O projeto já possui base arquitetural sólida para **criação do banco** e início de operação controlada. Para uso corporativo com alta confiabilidade, falta avançar em governança de mudanças, testes automatizados e operação orientada a métricas.

## Plano de evolução em Sprints (pronto para execução com Codex)

> Objetivo: você poderá criar manualmente as sprints e copiar as tarefas abaixo no seu board.

### Sprint 1 — Hardening de migrações e idempotência
**Meta:** eliminar risco de quebra ao reexecutar migrações.

**Tarefas**
1. Revisar todas as migrações e tornar operações sensíveis idempotentes (`CREATE POLICY`, `CREATE TRIGGER`, `CREATE VIEW`, `ALTER TABLE`).
2. Padronizar padrão de migração com blocos seguros (`DROP ... IF EXISTS` + `CREATE ...`) quando não houver suporte `IF NOT EXISTS`.
3. Criar guia em `docs/` com convenções de migração (nomenclatura, ordem, reversibilidade e dependências).
4. Validar execução sequencial limpa em banco vazio e reexecução em banco já provisionado.

**Critério de pronto (DoD)**
- Rodar migrações 2x sem erro no mesmo ambiente.
- Nenhuma migração dependente de estado manual oculto.

### Sprint 2 — Segurança/RLS e funções sensíveis
**Meta:** fechar lacunas de isolamento e privilégio.

**Tarefas**
1. Mapear tabelas sem RLS explícito (especialmente camadas `sys_integrations`, `rev_pix_*`, `jud_*`) e definir políticas por perfil/tenant.
2. Revisar funções `SECURITY DEFINER` e fixar `search_path` interno para reduzir risco de escalonamento.
3. Revisar `GRANT/REVOKE` de execução das funções utilitárias de autenticação.
4. Criar casos de teste SQL para validar acesso permitido/negado por perfil (`super_dev`, `adm_pgm`, `contribuinte`, etc.).

**Critério de pronto (DoD)**
- Matriz de acesso coberta por testes.
- Nenhuma tabela crítica sem política RLS definida.

### Sprint 3 — Qualidade de dados e regras de integridade
**Meta:** aumentar confiabilidade funcional dos dados.

**Tarefas**
1. Incluir constraints de consistência (ex.: `valor_pago > 0`, janelas temporais válidas, coerência de status).
2. Avaliar validação forte de documentos (CPF/CNPJ) em nível SQL/função.
3. Revisar triggers de negócio para idempotência em cenários de retry/reprocessamento.
4. Incluir trilhas de auditoria adicionais para mudanças críticas de status.

**Critério de pronto (DoD)**
- Regras críticas documentadas e validadas por testes.
- Redução de inconsistências detectadas nas views de monitor.

### Sprint 4 — Testes automatizados de banco no CI
**Meta:** tornar regressão de dados detectável antes de produção.

**Tarefas**
1. Estruturar suíte de testes SQL (ex.: pgTAP ou scripts SQL assertivos) para schema, RLS, triggers e views.
2. Configurar pipeline CI para subir banco efêmero e executar migrações + testes automaticamente.
3. Criar testes de “smoke migration” (ambiente vazio) e “drift check” (ambiente com histórico).
4. Publicar relatório de cobertura mínima por domínio (segurança, financeiro, judicial, integrações).

**Critério de pronto (DoD)**
- Pipeline falha automaticamente em quebra de migração/política.
- Execução de testes de banco em toda PR.

### Sprint 5 — Observabilidade e operação
**Meta:** aumentar previsibilidade operacional.

**Tarefas**
1. Definir e materializar indicadores: locks, queries lentas, crescimento por tabela, volume de outbox/fila.
2. Criar rotinas de housekeeping (retenção/arquivamento de logs e eventos de webhook).
3. Definir alertas operacionais (fila travada, erro em integração, divergência pagamento × baixa).
4. Documentar playbooks de incidente para falhas críticas de dados.

**Critério de pronto (DoD)**
- Dashboard operacional publicado.
- Alertas críticos com responsável e procedimento de resposta.

### Sprint 6 — Governança avançada e escala
**Meta:** preparar crescimento sustentável e compliance.

**Tarefas**
1. Definir versionamento de contrato de dados (breaking/non-breaking) e política de depreciação.
2. Implementar estratégia de backup/restore testado com metas RTO/RPO.
3. Avaliar particionamento para tabelas de alto volume (`sys_integration_logs`, `rev_pix_webhook_events`, auditoria).
4. Formalizar checklist de release de banco para produção.

**Critério de pronto (DoD)**
- Restore testado com evidência.
- Processo de release de banco institucionalizado.

## Checklist objetivo de prontidão para produção

- [ ] Migrações 100% reexecutáveis e idempotentes.
- [ ] Testes automatizados de segurança e integridade no CI.
- [ ] Política de backup + restore testado (RTO/RPO).
- [ ] Monitoramento proativo de performance e filas.
- [ ] Procedimentos de rollback e hotfix documentados.
- [ ] Revisão de privilégios e hardening de funções sensíveis.

---

**Conclusão:** o SIDAM está em um patamar bom para estruturar e expandir o banco de dados, mas ainda não no nível “operação de excelência”. O foco agora deve sair de “mais estrutura” para “confiabilidade operacional e governança de dados”.

## Status de execução

### Sprint 1 — Concluída (2026-03-24)
- [x] Idempotência aplicada em políticas RLS com `DROP POLICY IF EXISTS` + `CREATE POLICY`.
- [x] Idempotência aplicada em triggers com `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`.
- [x] Seed de configuração (`03_config_engine.sql`) ajustado com `ON CONFLICT DO UPDATE`.
- [x] Guia de convenções criado em `docs/db_migration_conventions.md`.
- [ ] Validação em banco real (execução dupla de migrações) pendente de pipeline/ambiente DB dedicado.

### Sprint 2 — Concluída (2026-03-24)
- [x] RLS expandido para módulos de integrações, PIX, judicial e filas sistêmicas.
- [x] Funções de autenticação ajustadas com `SET search_path = public, pg_temp`.
- [x] Hardening de privilégios com `REVOKE`/`GRANT EXECUTE` nas funções utilitárias de auth.
- [x] Casos de teste SQL criados para validar matriz de acesso por perfil/tenant (`supabase/tests/01_rls_access_matrix.sql`).
- [ ] Execução automatizada dos testes em CI pendente (próxima etapa da Sprint 4).

### Sprint 3 — Concluída (2026-03-24)
- [x] Constraints de consistência adicionadas para financeiro, temporal e progressão de lote judicial.
- [x] Validação forte de CPF/CNPJ em nível SQL (`fn_is_valid_cpf_cnpj`) aplicada à FDA.
- [x] Trigger de pagamento reforçado para reduzir duplicidade lógica de outbox.
- [x] Trilha de auditoria para mudança de `status_atual` da FDA (`sec_status_audit` + trigger dedicada).
- [x] Casos de teste SQL para integridade e auditoria adicionados (`supabase/tests/02_data_integrity_and_audit.sql`).
