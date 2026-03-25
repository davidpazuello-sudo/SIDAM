# Estratégia de Backup, Restore e Metas RTO/RPO (Sprint 6)

## Objetivo
Garantir recuperação confiável do banco em incidentes, com evidência auditável por ambiente.

## Metas
- **RTO alvo (prod):** até 30 minutos
- **RPO alvo (prod):** até 10 minutos
- **Frequência de teste de restore:** quinzenal em HML e mensal em PROD

## Política por ambiente
- **dev:** backup diário, retenção curta
- **hml:** backup diário + restore de validação quinzenal
- **prod:** backup contínuo (PITR) + snapshot diário + restore mensal validado

## Procedimento de validação de restore
1. Selecionar backup por timestamp.
2. Restaurar em ambiente isolado.
3. Rodar smoke migrations e suite SQL de testes.
4. Medir RTO/RPO atingidos.
5. Registrar evidência em `sys_backup_restore_evidence`.

## Evidências obrigatórias
- Referência do backup restaurado
- Timestamp de início/fim
- RTO e RPO medidos
- Resultado (`SUCESSO`/`FALHA`) e logs
- Link para artefatos de execução

## Critério de conformidade
- 100% dos testes de restore executados no período com evidência registrada.
- Desvio de RTO/RPO gera ação corretiva no backlog.
