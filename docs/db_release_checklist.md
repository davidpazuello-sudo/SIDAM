# Checklist de Release de Banco (Sprint 6)

## Pré-release
- [ ] Migrações aprovadas em revisão técnica.
- [ ] CI de banco verde (smoke + drift + SQL tests).
- [ ] Rollback/hotfix definido.
- [ ] Janela de manutenção aprovada.

## Durante release
- [ ] Executar migrações em ordem oficial.
- [ ] Validar objetos críticos (RLS, triggers, constraints, views).
- [ ] Verificar dashboards/alertas operacionais.

## Pós-release
- [ ] Rodar testes de fumaça de negócio.
- [ ] Validar ausência de backlog crítico (outbox/fila).
- [ ] Registrar execução em `sys_db_release_checklists`.
- [ ] Abrir plano de ação se houver qualquer desvio.
