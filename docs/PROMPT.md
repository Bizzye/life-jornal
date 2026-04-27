# 📓 Life Journal — Plano Mestre do App

## 1. Visão do Produto

**Life Journal** é um app mobile de diário pessoal orientado a progresso e histórico.
O usuário registra acontecimentos do dia a dia em 3 categorias:

- **Eventos**
- **Comida**
- **Informações pessoais**

Cada registro pode conter:

- categoria
- título
- descrição
- foto
- data/hora

O app terá foco em:

- **timeline diária**
- **visão mensal**
- **visão semestral**
- **histórico organizado por período**
- **experiência visual premium**, inspirada na referência com dark UI + glassmorphism + tons quentes

---

## 2. Objetivos de Arquitetura

Este projeto deve ser construído com mentalidade de produto real, priorizando:

- **segurança séria** no app e no banco
- **componentização forte**
- **código desacoplado**
- **tipagem end-to-end**
- **validação centralizada**
- **manutenibilidade**
- **facilidade para evoluir features sem virar bagunça**

Como o contexto é de alguém começando em React Native, a arquitetura deve evitar complexidade desnecessária e seguir convenções que funcionam bem com Expo.

---

## 3. Stack Oficial

| Camada               | Tecnologia            | Observação                                            |
| -------------------- | --------------------- | ----------------------------------------------------- |
| Mobile               | React Native + Expo   | Base principal do app                                 |
| UI                   | Tamagui               | Design system, primitives e layout                    |
| Linguagem            | TypeScript            | `strict: true`                                        |
| Navegação            | Expo Router           | Manter `app/` na raiz para seguir a convenção do Expo |
| Backend/BaaS         | Supabase              | Auth, PostgreSQL, Storage                             |
| ORM                  | Prisma                | Usado para schema, migrations e tipos do banco        |
| Formulários          | React Hook Form       | Controle de form performático                         |
| Validação            | Zod                   | Schemas centralizados                                 |
| Estado global        | Zustand               | Stores pequenas e objetivas                           |
| Upload de imagem     | expo-image-picker     | Seleção da galeria/câmera                             |
| Armazenamento seguro | expo-secure-store     | Tokens de sessão                                      |
| Ícones               | @tamagui/lucide-icons | Ícones consistentes                                   |

### Decisão importante sobre Prisma

> **Prisma não roda como camada principal de acesso ao banco dentro do app React Native.**
> Neste projeto, ele será usado para:

- manter o **schema do banco** versionado
- gerar **migrations**
- servir como **fonte tipada do modelo de dados**
- apoiar eventuais **Edge Functions** ou APIs server-side no futuro

No app mobile, o acesso aos dados será feito via **Supabase JS SDK**, protegido por **Auth + RLS + policies**.

---

## 4. Modelo do Domínio

### Categorias

| Categoria | Chave      | Cor       |
| --------- | ---------- | --------- |
| Eventos   | `event`    | `#E08A38` |
| Comida    | `food`     | `#4CAF50` |
| Pessoal   | `personal` | `#5B8DEF` |

### Entidade principal

```ts
type EntryCategory = "event" | "food" | "personal";

interface Entry {
  id: string;
  userId: string;
  category: EntryCategory;
  title: string;
  description: string | null;
  photoPath: string | null;
  createdAt: string;
}
```

---

## 5. Banco de Dados

### Prisma Schema

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

### SQL esperado no Supabase

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

## 6. Segurança

> **Princípio:** o client nunca é confiável. Segurança real fica em **Auth**, **RLS**, **Storage Policies**, **constraints no banco** e **validação server-safe**.

### Autenticação

- login por **email/senha**
- opção de evoluir para **Google** e **Apple**
- sessão persistida com `expo-secure-store`
- refresh automático do token
- rotas protegidas por auth guard no app

### RLS da tabela `entries`

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

### Storage privado para fotos

Bucket: `entry-photos`

Estrutura de arquivo:

```txt
entry-photos/{user_id}/{uuid}.jpg
```

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

### Regras adicionais de segurança

- bucket sempre **privado**
- `service_role key` nunca entra no app
- `anon key` pode ficar no app, porque a proteção real é o RLS
- validar imagem no client:
  - máximo `5MB`
  - somente `image/jpeg`, `image/png`, `image/webp`
- validar payloads com Zod antes de enviar
- usar constraints no banco para reforçar integridade

### Auth guard no app

```ts
export function useProtectedRoute(session: Session | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    }

    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, router]);
}
```

---

## 7. Estrutura de Pastas Ideal

> Para evitar atrito com o Expo Router, **`app/` fica na raiz** do projeto.
> Todo o restante fica em `src/`.

```txt
life-journal/
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── calendar.tsx
│       ├── new.tsx
│       └── profile.tsx
├── assets/
│   ├── images/
│   └── fonts/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   └── index.ts
│   │   ├── entry/
│   │   │   ├── EntryCard.tsx
│   │   │   ├── EntryList.tsx
│   │   │   ├── EntryForm.tsx
│   │   │   ├── CategoryChip.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── ImagePickerButton.tsx
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── SocialLoginButtons.tsx
│   │   │   └── index.ts
│   │   ├── calendar/
│   │   │   ├── MonthView.tsx
│   │   │   ├── SemesterView.tsx
│   │   │   ├── DaySummary.tsx
│   │   │   └── index.ts
│   │   ├── profile/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── StreakBadge.tsx
│   │   │   └── index.ts
│   │   └── layout/
│   │       ├── ScreenContainer.tsx
│   │       ├── Header.tsx
│   │       ├── BottomNav.tsx
│   │       ├── FAB.tsx
│   │       └── index.ts
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── NewEntryScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEntries.ts
│   │   ├── useImagePicker.ts
│   │   ├── useProtectedRoute.ts
│   │   ├── useCalendar.ts
│   │   ├── useGreeting.ts
│   │   └── useStats.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── entry.service.ts
│   │   ├── storage.service.ts
│   │   └── index.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── entry.store.ts
│   │   └── index.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── entry.schema.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── theme/
│   │   ├── tokens.ts
│   │   └── tamagui.config.ts
│   └── types/
│       ├── entry.types.ts
│       ├── navigation.types.ts
│       └── index.ts
├── .env
├── .env.example
├── app.json
├── babel.config.js
├── tsconfig.json
├── package.json
├── PROMPT.md
└── SETUP.md
```

---

## 8. Princípios de Código

### Regras principais

- rotas em `app/` devem ser **finas**: só renderizam screens
- screens compõem hooks + components
- components de `ui/` não conhecem regra de negócio
- services falam com Supabase
- hooks orquestram services + stores
- stores guardam estado global mínimo
- validação sempre vem dos schemas Zod
- evitar duplicação de tipos soltos quando o schema já define a fonte da verdade

### Patterns

| Pattern                   | Aplicação                                                   |
| ------------------------- | ----------------------------------------------------------- |
| Service Layer             | `auth.service.ts`, `entry.service.ts`, `storage.service.ts` |
| Controller Hook           | `useAuth`, `useEntries`, `useImagePicker`                   |
| Presentational Components | `Button`, `GlassCard`, `EntryCard`, `CategoryChip`          |
| Store Slice               | `auth.store.ts`, `entry.store.ts`                           |
| Schema-first Validation   | `auth.schema.ts`, `entry.schema.ts`                         |

---

## 9. Design System

### Estratégia de tokens centralizados

> Se quiser trocar o visual inteiro no futuro, a mudança deve começar em **um único ponto**: a paleta.

```ts
const palette = {
  black: "#0F1210",
  dark: "#1A1E1A",
  darkMid: "#2A3228",
  white: "#F5F0E8",
  white60: "rgba(245, 240, 232, 0.6)",
  white35: "rgba(245, 240, 232, 0.35)",
  white12: "rgba(255, 255, 255, 0.12)",
  white10: "rgba(255, 255, 255, 0.10)",
  white08: "rgba(255, 255, 255, 0.08)",
  white06: "rgba(255, 255, 255, 0.06)",
  amber: "#E08A38",
  amber20: "rgba(224, 138, 56, 0.2)",
  amber50: "rgba(224, 138, 56, 0.5)",
  green: "#4CAF50",
  blue: "#5B8DEF",
  red: "#EF4444",
  red15: "rgba(239, 68, 68, 0.15)",
  emerald: "#22C55E",
  emerald15: "rgba(34, 197, 94, 0.15)",
  yellow: "#F59E0B",
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

export const colors = {
  bgPrimary: palette.dark,
  bgSecondary: palette.black,
  bgGradientTop: palette.darkMid,
  bgCard: palette.white08,
  bgInput: palette.white06,
  bgOverlay: palette.overlay,
  textPrimary: palette.white,
  textSecondary: palette.white60,
  textMuted: palette.white35,
  textInverse: palette.dark,
  accent: palette.amber,
  accentLight: palette.amber20,
  categoryEvent: palette.amber,
  categoryFood: palette.green,
  categoryPersonal: palette.blue,
  border: palette.white12,
  borderFocus: palette.amber50,
  error: palette.red,
  errorLight: palette.red15,
  success: palette.emerald,
  successLight: palette.emerald15,
  warning: palette.yellow,
} as const;
```

### Shared UI Components planejados

> Esses componentes devem ser criados **depois** que o projeto Expo existir.

- `Button`
- `GlassCard`
- `Input`
- `TextArea`
- `Select`
- `Chip`
- `Avatar`
- `Divider`
- `LoadingOverlay`
- `ScreenContainer`
- `Header`
- `FAB`

Todos devem ser:

- tipados
- desacoplados de regra de negócio
- reutilizáveis
- compatíveis com RHF quando fizer sentido
- visualmente consistentes com os tokens

---

## 10. Telas

### Login

- fundo escuro com hero visual elegante
- login por email/senha
- CTA social opcional
- link para cadastro

### Cadastro

- nome
- email
- senha
- confirmação opcional conforme UX definida

### Home / Timeline diária

- saudação personalizada
- filtros por categoria
- lista do dia
- cards glassmorphism
- FAB para novo registro

### Novo registro

- select de categoria
- input de título
- textarea de descrição
- upload de foto
- preview da imagem
- submit com loading e tratamento de erro

### Calendário

- alternar mensal / semestral
- indicadores por categoria
- resumo do período

### Perfil

- avatar
- nome
- estatísticas do uso
- logout

---

## 11. Schemas de Validação

```ts
import { z } from "zod";

export const CATEGORIES = ["event", "food", "personal"] as const;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(80),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const createEntrySchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).optional().nullable(),
});
```

---

## 12. Ordem Correta de Execução

> **Muito importante:** não criar arquivos de código antes de scaffoldar o projeto.

### Ordem certa

1. criar o app com Expo
2. instalar dependências
3. configurar envs
4. configurar Supabase
5. configurar Prisma
6. criar estrutura de pastas
7. criar tokens e design system
8. criar auth
9. criar CRUD de entries
10. criar calendário e perfil

### Motivo

Se você criar `src/`, componentes e estrutura antes do `create-expo-app`, o scaffold pode sobrescrever ou conflitar com a base do projeto.

---

## 13. Roadmap de Implementação

### Fase 0 — Scaffold

- [ ] Rodar `npx create-expo-app@latest life-journal -t tabs`
- [ ] Garantir que o projeto sobe com `npx expo start`
- [ ] Instalar dependências principais

### Fase 1 — Fundação

- [ ] Configurar `TypeScript strict`
- [ ] Configurar path alias `@/*`
- [ ] Configurar `expo-router`
- [ ] Criar estrutura de pastas
- [ ] Configurar `src/theme/tokens.ts`
- [ ] Configurar `src/theme/tamagui.config.ts`

### Fase 2 — Infra e segurança

- [ ] Criar projeto no Supabase
- [ ] Configurar `.env`
- [ ] Criar tabela `entries`
- [ ] Habilitar RLS
- [ ] Criar bucket privado
- [ ] Configurar policies de storage
- [ ] Configurar auth client com `expo-secure-store`

### Fase 3 — Design System

- [ ] Criar shared UI components
- [ ] Criar componentes de layout
- [ ] Criar barrel exports

### Fase 4 — Auth

- [ ] `auth.schema.ts`
- [ ] `auth.service.ts`
- [ ] `auth.store.ts`
- [ ] `useAuth.ts`
- [ ] `useProtectedRoute.ts`
- [ ] telas de login e cadastro

### Fase 5 — Entries

- [ ] `entry.schema.ts`
- [ ] `entry.service.ts`
- [ ] `entry.store.ts`
- [ ] `useEntries.ts`
- [ ] `useImagePicker.ts`
- [ ] `EntryForm`, `EntryCard`, `EntryList`
- [ ] tela de novo registro
- [ ] home com timeline diária

### Fase 6 — Histórico

- [ ] calendário mensal
- [ ] visão semestral
- [ ] agrupamento por período

### Fase 7 — Perfil e acabamento

- [ ] estatísticas
- [ ] logout
- [ ] empty states
- [ ] loading states
- [ ] tratamento de erro
- [ ] refinamento visual

---

## 14. Comandos Iniciais

```bash
npx create-expo-app@latest life-journal -t tabs
cd life-journal

npx expo install @tamagui/core @tamagui/config @tamagui/lucide-icons
npx expo install @supabase/supabase-js react-native-url-polyfill expo-secure-store
npx expo install expo-image-picker expo-file-system

npm install react-hook-form @hookform/resolvers zod zustand
npm install @prisma/client
npm install -D prisma

npx prisma init
```

---

## 15. Referência Visual

Direção visual baseada na imagem enviada:

- fundo escuro com gradiente sofisticado
- blocos com aparência de vidro
- contraste alto entre texto e fundo
- destaque âmbar nos CTAs e elementos de foco
- sensação premium, minimalista e pessoal

---

## 16. Resumo Executivo

Este app deve ser implementado como um projeto **senior-level**, com:

- arquitetura clara
- segurança séria
- design system consistente
- forms com RHF + Zod
- Supabase como backend
- Prisma para schema/migrations/tipos
- shared components bem definidos
- base preparada para crescer sem retrabalho
