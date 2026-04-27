# 🔧 Life Journal — Guia de Setup e Infra

Este guia foi revisado para seguir a ordem correta de execução:

1. scaffold do app
2. instalação das dependências
3. configuração do Supabase
4. configuração do Prisma
5. configuração de segurança
6. início da implementação

> **Importante:** crie o projeto Expo primeiro. Só depois comece a criar `src/`, componentes e estrutura final.

---

## 1. Criar o projeto Expo

```bash
npx create-expo-app@latest life-journal -t tabs
cd life-journal
npx expo start
```

Confirme que o projeto sobe corretamente antes de seguir.

---

## 2. Instalar dependências

### UI e design system

```bash
npx expo install @tamagui/core @tamagui/config @tamagui/lucide-icons
```

### Supabase e segurança

```bash
npx expo install @supabase/supabase-js react-native-url-polyfill expo-secure-store
```

### Imagens

```bash
npx expo install expo-image-picker expo-file-system
```

### Forms, validação e estado

```bash
npm install react-hook-form @hookform/resolvers zod zustand
```

### Prisma

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

---

## 3. Ajustes iniciais do projeto

### `tsconfig.json`

- habilitar `strict: true`
- configurar alias `@/*` apontando para `src/*`

Exemplo:

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Estrutura recomendada

- manter `app/` na raiz por causa do Expo Router
- criar `src/` para components, hooks, services, stores, schemas, theme e utils

---

## 4. Criar projeto no Supabase

1. Acesse `https://supabase.com`
2. Clique em **New project**
3. Nome: `life-journal`
4. Escolha região próxima
5. Defina senha forte do banco
6. Aguarde a criação

---

## 5. Variáveis de ambiente

No painel do Supabase, vá em **Settings → API** e copie:

- `Project URL`
- `anon public key`

Crie `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxx
DATABASE_URL=postgresql://postgres:senha@db.xxxx.supabase.co:5432/postgres
```

Crie `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
```

Garanta no `.gitignore`:

```gitignore
.env
.env.local
```

> Nunca coloque `service_role key` no app.

---

## 6. Configurar Prisma

No arquivo `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Entry {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  category    Category
  title       String   @db.VarChar(100)
  description String?  @db.VarChar(2000)
  photoPath   String?  @map("photo_path")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz

  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@index([userId, category])
  @@map("entries")
}

enum Category {
  event
  food
  personal
}
```

Depois gere o client:

```bash
npx prisma generate
```

> Neste projeto, o Prisma é para schema, migrations e tipagem. O app mobile continua usando o Supabase JS SDK para runtime.

---

## 7. Criar tabela `entries` no Supabase

No SQL Editor do Supabase:

```sql
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text check (category in ('event', 'food', 'personal')) not null,
  title text not null check (char_length(title) between 1 and 100),
  description text check (description is null or char_length(description) <= 2000),
  photo_path text,
  created_at timestamptz default now() not null
);

create index idx_entries_user_id on public.entries(user_id);
create index idx_entries_created_at on public.entries(created_at desc);
create index idx_entries_user_category on public.entries(user_id, category);
```

---

## 8. Habilitar RLS

```sql
alter table public.entries enable row level security;

create policy "entries_select_own"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "entries_insert_own"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "entries_update_own"
  on public.entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "entries_delete_own"
  on public.entries for delete
  using (auth.uid() = user_id);
```

Verifique no painel se o RLS está ativo.

---

## 9. Criar bucket privado de imagens

No Supabase Storage:

- bucket name: `entry-photos`
- `public`: **desligado**
- limite de tamanho: `5MB`
- tipos permitidos: `image/jpeg`, `image/png`, `image/webp`

Policies:

```sql
create policy "storage_select_own"
  on storage.objects for select
  using (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_update_own"
  on storage.objects for update
  using (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

Padrão de path:

```txt
entry-photos/{user_id}/{uuid}.jpg
```

---

## 10. Configurar Auth no Supabase

### Email/Senha

Em **Authentication → Providers → Email**:

- habilitar provider
- habilitar confirmação de email
- habilitar secure email change

### OAuth futuro

Se quiser depois:

- Google
- Apple

Mas para começar, recomendo implementar primeiro **email/senha** e deixar social login para a fase 2 do produto.

---

## 11. Configurar client do Supabase no app

Criar `src/lib/supabase.ts`:

```ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

---

## 12. Ordem recomendada de implementação

1. configurar tema e tokens
2. criar shared UI components
3. criar schemas Zod
4. criar services
5. criar stores Zustand
6. criar hooks
7. criar auth screens
8. criar entry screens
9. criar calendário
10. criar perfil

---

## 13. Checklist de segurança

- [ ] `service_role key` fora do app
- [ ] `.env` no `.gitignore`
- [ ] RLS ativo na tabela `entries`
- [ ] bucket de imagens privado
- [ ] policies de storage criadas
- [ ] tokens armazenados no `SecureStore`
- [ ] auto refresh de sessão ativo
- [ ] payloads validados com Zod
- [ ] limitações de imagem no client
- [ ] constraints no banco criadas

---

## 14. Checklist de validação manual

- [ ] criar usuário A
- [ ] criar usuário B
- [ ] confirmar que A não vê dados de B
- [ ] confirmar que A não acessa imagens de B
- [ ] fazer logout e validar redirect para login
- [ ] validar upload de imagem válida
- [ ] validar rejeição de imagem inválida ou maior que 5MB
