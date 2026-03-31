---
name: novo-skill
description: Configurar e padronizar a criação de um novo skill Codex com frontmatter correto, gatilhos claros de uso, estrutura mínima (SKILL.md + agents/openai.yaml) e validação final. Use este skill quando o usuário pedir para criar, configurar, ajustar ou revisar skills.
---

# Novo Skill

## Objetivo

Criar ou ajustar um skill reutilizável com instruções curtas, gatilhos bem definidos e validação automática.

## Fluxo rápido

1. Definir nome em hyphen-case (ex.: `analise-contratos`).
2. Escrever descrição com:
   - o que o skill faz;
   - quando deve ser acionado;
   - tipos de tarefa que disparam o skill.
3. Garantir a estrutura mínima:
   - `SKILL.md` com frontmatter válido (`name` e `description`);
   - `agents/openai.yaml` com `display_name`, `short_description`, `default_prompt`.
4. Incluir recursos apenas quando necessário:
   - `scripts/` para automações repetitivas;
   - `references/` para guias extensos;
   - `assets/` para templates/arquivos de saída.
5. Rodar validação com `quick_validate.py` e corrigir problemas.

## Padrões de qualidade

- Manter `SKILL.md` direto ao ponto.
- Usar verbos no imperativo nas instruções.
- Evitar documentação redundante fora do skill.
- Referenciar arquivos de `references/` diretamente no `SKILL.md` quando existirem.

## Checklist de entrega

Use `references/checklist.md` antes de finalizar para confirmar consistência e acionamento do skill.
