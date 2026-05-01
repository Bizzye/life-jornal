## Descrição

<!-- O que esse PR faz? (1-2 frases) -->

## Mudanças

<!-- Liste os arquivos alterados e por quê -->

-

## Como Testar

<!-- Passos que um reviewer pode seguir para verificar -->

1. `npm install` (se dependências mudaram)
2. `npx expo start`
3.

## Checklist

- [ ] TypeScript compila sem erros (`npx tsc --noEmit`)
- [ ] Testei no Android / Web
- [ ] Atualizei tipos em `src/types/` se necessário
- [ ] Validações usam schemas Zod de `src/schemas/`
- [ ] Cores usam tokens de `src/theme/tokens.ts` (não hex hardcoded)
- [ ] Rotas em `app/` são finas (lógica nos screens/hooks)
- [ ] Migrações SQL adicionadas em `supabase/migrations/` se schema mudou
