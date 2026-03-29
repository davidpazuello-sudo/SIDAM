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

## Fase 2 — Detalhamento inicial de objetos prioritários

### Objeto: `sec_organization` (Secretarias/Órgãos)

**Definição funcional:** representa cada órgão/secretaria participante do sistema multi-tenant.

**Propriedades sugeridas**
| Propriedade | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `id` | uuid | sim | PK |
| `name` | text | sim | nome oficial da secretaria |
| `slug` | text | sim | único, usado em integrações e URLs |
| `is_active` | boolean | sim | padrão `true` |
| `created_at` | timestamptz | sim | padrão `now()` |
| `updated_at` | timestamptz | sim | atualização automática |

**Relacionamentos**
- 1:N com `sec_user_secretariat`
- 1:N com objetos de negócio (`obj_fda`, `obj_cda`, `obj_pagamento_da`)

**Acesso esperado**
- PGM/super-admin: visão global
- Secretaria: visão do próprio `organization_id`

---

### Objeto: `sec_user_secretariat` (vínculo usuário ↔ secretaria)

**Definição funcional:** tabela de associação entre usuário e secretaria, com papel organizacional.

**Propriedades sugeridas**
| Propriedade | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `id` | uuid | sim | PK |
| `user_id` | uuid | sim | referência ao usuário de autenticação |
| `organization_id` | uuid | sim | FK para `sec_organization.id` |
| `role_in_secretariat` | text | sim | ex: `gestor`, `analista`, `operador` |
| `is_primary` | boolean | sim | define vínculo principal |
| `created_at` | timestamptz | sim | padrão `now()` |

**Relacionamentos**
- N:1 com `sec_organization`

**Acesso esperado**
- Super-admin/PGM para gestão
- Usuário só visualiza seus próprios vínculos

---

### Objeto: `sec_usuario_cidadao` (usuário cidadão)

**Definição funcional:** metadados de perfil do cidadão para portal e autoatendimento.

**Propriedades sugeridas**
| Propriedade | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `id` | uuid | sim | PK |
| `auth_user_id` | uuid | sim | usuário autenticado (Gov.br/SSO) |
| `cpf_cnpj` | text | sim | único, validado (CPF/CNPJ) |
| `nome_completo` | text | sim | nome de exibição |
| `email` | text | não | contato |
| `telefone` | text | não | contato |
| `created_at` | timestamptz | sim | padrão `now()` |
| `updated_at` | timestamptz | sim | atualização automática |

**Relacionamentos**
- 1:N com `obj_fda` por documento do devedor (lógica de visão)

**Acesso esperado**
- Próprio cidadão: somente seus dados
- PGM: acesso restrito por finalidade administrativa

---

### Objeto: `sec_usuario_pgm` (usuário PGM)

**Definição funcional:** cadastro dos usuários institucionais da PGM com privilégios administrativos.

**Propriedades sugeridas**
| Propriedade | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `id` | uuid | sim | PK |
| `auth_user_id` | uuid | sim | usuário de autenticação |
| `email` | text | sim | único |
| `nome` | text | sim | nome funcional |
| `cargo` | text | sim | ex: procurador, analista, admin |
| `profile_slug` | text | sim | ex: `adm_pgm`, `procurador_pgm`, `super_dev` |
| `is_active` | boolean | sim | padrão `true` |
| `created_at` | timestamptz | sim | padrão `now()` |

**Relacionamentos**
- Pode administrar `sec_organization`, `cfg_*`, `sys_*` e objetos de negócio

**Acesso esperado**
- Visão global conforme perfil (`profile_slug`)

---

## Próximo lote recomendado (Fase 2.1)
1. `obj_fda`
2. `obj_cda`
3. `obj_pagamento_da`
4. `obj_cadim`
5. `sys_integrations`

## Fase 2.1 — Detalhamento complementar

### Objeto: `obj_fda` (Ficha Cadastral da Dívida Ativa)

**Definição funcional:** registro mestre da inscrição em dívida ativa, concentrando dados do devedor, origem do débito e situação atual da cobrança.

**Propriedades sugeridas**
| Propriedade | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `id` | uuid | sim | PK |
| `organization_id` | uuid | sim | FK para `sec_organization.id` |
| `numero_inscricao` | text | sim | único por `organization_id` |
| `devedor_documento` | text | sim | CPF/CNPJ validado |
| `devedor_nome` | text | sim | nome/razão social |
| `origem_credito` | text | sim | ex: IPTU, ISS, multa |
| `valor_original` | numeric(14,2) | sim | >= 0 |
| `valor_atualizado` | numeric(14,2) | sim | >= `valor_original` após atualização |
| `data_inscricao` | date | sim | data formal da inscrição |
| `status` | text | sim | ex: `ativa`, `parcelada`, `suspensa`, `quitada` |
| `created_at` | timestamptz | sim | padrão `now()` |
| `updated_at` | timestamptz | sim | atualização automática |

**Relacionamentos**
- 1:N com `obj_cda`
- 1:N com `obj_pagamento_da`
- 1:N com `obj_parcelamento_da`
- 1:N com `obj_cadim`

**Acesso esperado**
- PGM: leitura/escrita completa conforme perfil
- Secretaria: leitura/escrita limitada à própria `organization_id`
- Cidadão: leitura restrita aos próprios registros via documento

---

### Objeto: `obj_cda` (Certidão de Dívida Ativa)

**Definição funcional:** título executivo emitido a partir da inscrição em dívida ativa, com metadados de emissão e controle jurídico.

**Propriedades sugeridas**
| Propriedade | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `id` | uuid | sim | PK |
| `organization_id` | uuid | sim | FK para `sec_organization.id` |
| `fda_id` | uuid | sim | FK para `obj_fda.id` |
| `numero_cda` | text | sim | único por `organization_id` |
| `ano_exercicio` | int | sim | ano fiscal da origem |
| `data_emissao` | date | sim | data de geração |
| `valor_emitido` | numeric(14,2) | sim | >= 0 |
| `situacao` | text | sim | ex: `emitida`, `ajuizada`, `suspensa`, `cancelada` |
| `hash_documento` | text | não | hash para integridade do PDF |
| `created_at` | timestamptz | sim | padrão `now()` |

**Relacionamentos**
- N:1 com `obj_fda`
- 1:N com `jud_processes` (quando ajuizada)
- 1:N com `obj_anexo_processo` (documentos da CDA)

**Acesso esperado**
- PGM/jurídico: emissão, consulta e retificação
- Secretaria arrecadadora: consulta
- Cidadão: consulta de segunda via quando permitido

---

### Objeto: `obj_pagamento_da` (Pagamentos da dívida ativa)

**Definição funcional:** eventos financeiros de liquidação total/parcial de débitos inscritos, incluindo conciliação e rastreabilidade.

**Propriedades sugeridas**
| Propriedade | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `id` | uuid | sim | PK |
| `organization_id` | uuid | sim | FK para `sec_organization.id` |
| `fda_id` | uuid | sim | FK para `obj_fda.id` |
| `cda_id` | uuid | não | FK para `obj_cda.id` (quando aplicável) |
| `canal_pagamento` | text | sim | ex: `pix`, `boleto`, `guia` |
| `valor_pago` | numeric(14,2) | sim | > 0 |
| `data_pagamento` | timestamptz | sim | carimbo da transação |
| `status_conciliacao` | text | sim | ex: `pendente`, `conciliado`, `divergente` |
| `txid_externo` | text | não | id da transação no provedor |
| `created_at` | timestamptz | sim | padrão `now()` |

**Relacionamentos**
- N:1 com `obj_fda`
- N:1 com `obj_cda` (opcional)
- Pode referenciar `rev_pix_payments` para pagamentos PIX

**Acesso esperado**
- PGM/financeiro: leitura completa e tratamento de divergências
- Secretaria: consulta por `organization_id`
- Cidadão: visualização de pagamentos próprios

---

### Objeto: `obj_cadim` (restrições CADIM)

**Definição funcional:** controle de inclusão/baixa de restrições no CADIM e histórico de status por devedor ou inscrição.

**Propriedades sugeridas**
| Propriedade | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `id` | uuid | sim | PK |
| `organization_id` | uuid | sim | FK para `sec_organization.id` |
| `fda_id` | uuid | sim | FK para `obj_fda.id` |
| `cpf_cnpj` | text | sim | CPF/CNPJ validado |
| `status` | text | sim | `incluido`, `baixado`, `suspenso` |
| `motivo_status` | text | não | justificativa da mudança |
| `data_inclusao` | date | não | obrigatória quando `status=incluido` |
| `data_baixa` | date | não | obrigatória quando `status=baixado` |
| `protocolo_externo` | text | não | referência no sistema externo |
| `created_at` | timestamptz | sim | padrão `now()` |

**Relacionamentos**
- N:1 com `obj_fda`
- N:1 com `sec_organization`
- Pode gerar eventos em `sys_event_outbox` para sincronização externa

**Acesso esperado**
- PGM: gestão completa de inclusão/baixa
- Secretaria: consulta com restrições de permissão
- Cidadão: sem acesso direto ao histórico operacional interno

---

### Objeto: `sys_integrations` (catálogo de integrações)

**Definição funcional:** inventário central das integrações ativas/inativas do sistema, com configuração de endpoint, autenticação e políticas de operação.

**Propriedades sugeridas**
| Propriedade | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `id` | uuid | sim | PK |
| `organization_id` | uuid | não | nulo para integrações globais |
| `integration_key` | text | sim | identificador único (ex: `cadim_sync`) |
| `provider_name` | text | sim | nome do fornecedor/sistema |
| `base_url` | text | sim | endpoint raiz |
| `auth_type` | text | sim | ex: `api_key`, `oauth2`, `mTLS` |
| `auth_secret_ref` | text | sim | referência no cofre de segredos |
| `is_active` | boolean | sim | padrão `true` |
| `timeout_ms` | int | sim | default seguro (ex: 10000) |
| `retry_policy_id` | uuid | não | FK para `sys_retry_policy.id` |
| `created_at` | timestamptz | sim | padrão `now()` |
| `updated_at` | timestamptz | sim | atualização automática |

**Relacionamentos**
- 1:N com `sys_integration_logs`
- 1:N com `obj_integration_queue`
- N:1 com `sys_retry_policy`

**Acesso esperado**
- Super-admin/devops: criação e manutenção
- PGM técnico: consulta e acompanhamento
- Demais perfis: sem acesso direto a segredos
