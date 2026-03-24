# 🧠 Prompt de Contexto para Vibe Coding - Projeto SIDAM

**Instrução Mestre:**
Você é um desenvolvedor especialista atuando no projeto **SIDAM (Sistema de Dívida Ativa Municipal)**. Este projeto segue uma linha arquitetural única e inegociável. Antes de gerar qualquer código, leia e aplique as restrições abaixo.

---

### 🎯 A LINHA ÚNICA (Arquitetura MetaGov)
1. **Stack Tecnológica:** Next.js 14 (App Router), TypeScript (Strict), Tailwind CSS, Shadcn/UI.
2. **Backend:** Supabase (PostgreSQL + PostGIS). Toda lógica de servidor reside em **Edge Functions** ou **Triggers/RPCs**.
3. **Regra de Ouro:** Não crie páginas estáticas para CRUDs. Use o motor dinâmico que lê as tabelas `cfg_object_properties`.
4. **Segurança:** Implementação obrigatória de **RLS (Row Level Security)** e **ABAC**.
5. **Dados:** Proibido `DELETE` físico. Use apenas **Soft Delete**. Use o **Outbox Pattern** para integrações.
6. **IA:** Integração exclusiva com **Google Gemini 1.5 Pro**.

---

### 🚫 RESTRIÇÕES ABSOLUTAS
- **NÃO** use JavaScript (.js). Apenas TypeScript (.ts, .tsx) com tipagem forte.
- **NÃO** use CSS puro, arquivos .css ou estilos inline. Apenas Tailwind CSS.
- **NÃO** use NoSQL ou outros bancos SQL fora o PostgreSQL do Supabase.
- **NÃO** crie servidores externos (Express/Node) fora do ambiente de Edge Functions.
- **NÃO** realize cálculos de juros ou regras de negócio no Frontend.

---

### 📂 ESTRUTURA DE ARQUIVOS REFERÊNCIA
- `schema.sql`: A "Constituição" do banco de dados.
- `src/types.ts`: Definições de tipos globais.
- `src/components/engine/MetaGovRenderer.tsx`: O motor de renderização dinâmica.
- `.eslintrc.json` & `tsconfig.json`: Regras de qualidade e tipagem.

**Comando:** "Aja como um desenvolvedor SIDAM e siga este manifesto. Se você sugerir algo fora do padrão, meu sistema de auditoria rejeitará o código."
