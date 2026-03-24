# Catálogo Inicial de Objetos do Sistema (Fase 1)

> Objetivo desta fase: **somente listar os objetos** do sistema.
> Na próxima fase, detalharemos as propriedades de cada objeto.

## 1) Segurança, Identidade e Acesso

1. `sec_organization` (Secretarias/Órgãos)
2. `sec_user_profiles` (Perfis de usuário)
3. `sec_user_secretariat` (vínculo usuário ↔ secretaria)
4. `sec_usuario_cidadao` (usuário cidadão)
5. `sec_usuario_pgm` (usuário PGM)
6. `sec_roles` (papéis/cargos)
7. `sec_permissions` (permissões)
8. `sec_role_permissions` (papel ↔ permissão)
9. `sec_audit_log` (auditoria de segurança)
10. `sec_status_audit` (auditoria de mudança de status)

## 2) Núcleo da Dívida Ativa

11. `obj_fda` (Ficha Cadastral da Dívida Ativa)
12. `obj_cda` (Certidão de Dívida Ativa)
13. `obj_pagamento_da` (Pagamentos da dívida ativa)
14. `obj_parcelamento_da` (parcelamentos)
15. `obj_cadim` (restrições CADIM)
16. `obj_evento_negociacao` (eventos de negociação)
17. `obj_anexo_processo` (documentos/anexos)

## 3) Integrações e Resiliência

18. `sys_integrations` (catálogo de integrações)
19. `sys_integration_logs` (logs de integração)
20. `obj_integration_queue` (fila de integrações)
21. `sys_event_outbox` (outbox pattern)
22. `sys_webhook_inbox` (eventos recebidos)
23. `sys_retry_policy` (políticas de retry)

## 4) Arrecadação e PIX

24. `rev_pix_payments` (pagamentos PIX)
25. `rev_pix_webhook_events` (eventos webhook PIX)
26. `rev_billing_events` (eventos de cobrança)

## 5) Jurídico

27. `jud_processes` (processos judiciais)
28. `jud_filing_batches` (lotes de ajuizamento)
29. `jud_intimacoes` (intimações)
30. `jud_movimentacoes` (movimentações processuais)

## 6) Configuração Dinâmica (MetaGov Engine)

31. `cfg_object_types` (tipos de objeto)
32. `cfg_object_properties` (propriedades dinâmicas)
33. `cfg_object_workflows` (estados/transições)
34. `cfg_object_validations` (regras de validação)
35. `cfg_object_permissions` (permissões por objeto)

## 7) Branding e Customização

36. `sys_branding` (identidade visual por prefeitura)
37. `sys_theme_tokens` (tokens de tema)
38. `sys_feature_flags` (features habilitadas)

## 8) Observabilidade e Operação

39. `sys_housekeeping_runs` (execuções de limpeza)
40. `sys_alert_rules` (regras de alerta)
41. `sys_alert_events` (eventos de alerta)
42. `sys_slo_targets` (metas de SLO)

## 9) Governança de Dados

43. `sys_data_contracts` (contratos de dados)
44. `sys_data_contract_versions` (versões do contrato)
45. `sys_db_release_checklists` (checklist de release)
46. `sys_backup_restore_evidence` (evidência de backup/restore)
47. `sys_retention_policies` (retenção por objeto)

## 10) Inteligência e Analytics

48. `ana_recovery_scores` (score de recuperabilidade)
49. `ana_risk_signals` (sinais de risco)
50. `ana_kpi_snapshots` (snapshots de indicadores)

---

## Próximo passo (Fase 2)
Detalhar para cada objeto:
- definição funcional,
- propriedades (nome, tipo, obrigatório),
- relacionamento,
- regras de negócio,
- perfil que acessa,
- regras RLS.
