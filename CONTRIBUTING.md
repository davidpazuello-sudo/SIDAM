# Como contribuir com o SIDAM

## Fluxo de trabalho

1. **Crie uma branch** a partir de `main`:
   ```bash
   git checkout -b feat/nome-da-feature
   # ou
   git checkout -b fix/descricao-do-bug
   ```

2. **Faça commits atômicos** seguindo Conventional Commits:
   ```
   feat(fda): adiciona listagem paginada com filtros
   fix(auth): corrige redirect após token expirado
   chore(deps): atualiza @supabase/supabase-js
   test(pix): adiciona testes para pixService
   ```

3. **Antes de abrir PR**, certifique-se que:
   ```bash
   npm run build
   npx tsc --noEmit
   npm test
   ```

4. **Abra um Pull Request** descrevendo as mudanças usando o template.

## Regras inegociáveis

- ❌ Nunca use `DELETE` no banco — use `status = 'CANCELADO'`
- ❌ Nunca crie CRUD estático — use o MetaGov Engine
- ❌ Nunca escreva `.js` — apenas `.ts` e `.tsx`
- ❌ Nunca use CSS inline — apenas Tailwind
- ✅ Sempre passe `organization_id` nas queries (multi-tenancy)
