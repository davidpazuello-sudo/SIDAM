# Playbooks de Incidentes de Dados (Sprint 5)

## 1) Fila Outbox travada

**Sinais**
- Alertas em `monitor_alertas_operacionais` com `OUTBOX_BACKLOG_CRITICO`.
- `monitor_outbox_backlog` mostra `status='PENDENTE'` com `oldest_age_seconds` crescente.

**Ações**
1. Identificar organização impactada no alerta.
2. Validar integração downstream (webhook, filas e worker).
3. Reprocessar lote pendente e monitorar redução do backlog.
4. Registrar incidente em auditoria operacional.

## 2) Integração externa com falhas repetidas

**Sinais**
- Alertas `INTEGRATION_FAILURE_RATE`.
- `monitor_integrations_health` com `falhas_24h` alto e latência elevada.

**Ações**
1. Confirmar credenciais/chaves da integração.
2. Validar conectividade e timeout no endpoint externo.
3. Ativar modo degradação (circuit breaker) se necessário.
4. Rodar smoke test controlado da integração.

## 3) Divergência pagamento x baixa

**Sinais**
- Alerta `PAYMENT_BAIXA_DIVERGENCIA`.
- Views de sanidade financeira indicam pagamento com status da FDA ainda `ATIVA`.

**Ações**
1. Conferir trigger `fn_trigger_pagamento_safe` e logs de erro.
2. Verificar bloqueio por RLS/políticas no insert da outbox.
3. Corrigir status e emitir trilha de auditoria da ação corretiva.
4. Revisar monitoramento para prevenir reincidência.

## 4) Housekeeping não executa

**Sinais**
- `sys_housekeeping_runs` com `status='FALHA'`.
- Crescimento anômalo em `monitor_table_growth` (logs/eventos).

**Ações**
1. Ler `error_message` da última execução falha.
2. Rodar `SELECT public.fn_run_housekeeping(90);` manualmente em janela segura.
3. Ajustar retenção por volume e requisitos legais.
4. Revalidar tamanho de tabelas após limpeza.

## Escalonamento
- **Nível ALTO/CRÍTICO:** acionar responsável de dados + responsável de integração.
- **Pós-incidente:** gerar RCA, plano de mitigação e ação preventiva em backlog.
