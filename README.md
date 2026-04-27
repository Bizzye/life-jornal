# 📓 Life Journal

Diário pessoal mobile com foco em progresso e histórico. Registre acontecimentos do dia a dia organizados por categorias, com timeline diária, visão por calendário e experiência visual premium.

## Stack

| Camada      | Tecnologia                             | Versão           |
| ----------- | -------------------------------------- | ---------------- |
| Framework   | React Native + Expo                    | SDK 54           |
| UI          | Tamagui                                | 2.0.0-rc.41      |
| Navegação   | Expo Router                            | 6.x              |
| Backend     | Supabase (Auth + PostgreSQL + Storage) | local via Docker |
| Formulários | React Hook Form + Zod                  | RHF 7.x, Zod 4.x |
| Estado      | Zustand                                | 5.x              |
| Ícones      | lucide-react-native                    | 1.x              |
| Linguagem   | TypeScript (strict)                    | 5.9              |
| Build       | EAS Build                              | eas-cli 18.x     |

## Funcionalidades Implementadas

- **Autenticação** — Email/senha com Supabase Auth, sessão persistida (expo-secure-store no mobile, localStorage na web)
- **CRUD de Registros** — Criar, listar, deletar registros com categoria, título, descrição, data/hora e até 3 fotos
- **Categorias** — Eventos (âmbar), Comida (verde), Pessoal (azul) — com ícones e filtros
- **Timeline** — Home com SectionList agrupada por dia (Hoje, Ontem, data completa), infinite scroll (5 por página)
- **Upload de fotos** — Seleção via galeria, upload para Supabase Storage, carrossel de imagens
- **Proteção de rotas** — Auth guard que redireciona para login/tabs conforme sessão
- **RLS** — Row Level Security em todas as operações do banco
- **Compatibilidade web** — DateInput/TimeInput com inputs nativos HTML, localStorage como fallback de SecureStore

## Estrutura do Projeto

```
life-journal/
├── app/                          # Rotas (Expo Router) — camada fina
│   ├── _layout.tsx               # Root: TamaguiProvider + AuthInit + ProtectedRoute
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/                   # Grupo de tabs principais
│       ├── index.tsx             # Home (timeline)
│       ├── calendar.tsx          # Calendário (placeholder)
│       ├── new.tsx               # Novo registro
│       └── profile.tsx           # Perfil + logout
├── src/
│   ├── components/
│   │   ├── auth/                 # LoginForm, RegisterForm
│   │   ├── layout/               # Header, ScreenContainer
│   │   ├── registro/             # RegistroCard, RegistroForm, RegistroList
│   │   └── ui/                   # Button, Chip, DateInput, FAB, GlassCard,
│   │                             # ImageCarousel, Input, LoadingOverlay,
│   │                             # Select, TextArea, TimeInput
│   ├── hooks/                    # useAuth, useRegistros, useImagePicker, useProtectedRoute
│   ├── lib/                      # supabase client, constants, utils
│   ├── schemas/                  # Zod schemas (auth, registro)
│   ├── screens/                  # Screens compostas (Home, Login, Register, etc.)
│   ├── services/                 # auth.service, registro.service, storage.service
│   ├── stores/                   # Zustand (auth.store, registro.store)
│   ├── theme/                    # tokens.ts (paleta + cores semânticas), tamagui.config.ts
│   └── types/                    # Registro, UserProfile, Category
├── supabase/
│   ├── config.toml               # Configuração do Supabase local
│   └── migrations/               # 4 migrações SQL
├── docs/
│   ├── PROMPT.md                 # Plano mestre do app
│   └── SETUP.md                  # Guia de setup
├── .env                          # Variáveis de ambiente (não versionado)
├── .env.example                  # Template de variáveis
├── app.json                      # Configuração Expo
├── eas.json                      # Configuração EAS Build
├── tsconfig.json                 # TypeScript strict + path alias @/*
└── package.json
```

## Modelo de Dados

Tabela `registros` no PostgreSQL (via Supabase):

| Coluna       | Tipo        | Descrição                      |
| ------------ | ----------- | ------------------------------ |
| `id`         | uuid        | PK, auto-gerado                |
| `user_id`    | uuid        | FK para auth.users             |
| `category`   | text        | `event`, `food` ou `personal`  |
| `title`      | text        | Título do registro             |
| `body`       | text        | Descrição (opcional)           |
| `event_date` | timestamptz | Data/hora do evento            |
| `photo_urls` | text[]      | Array de URLs de fotos (max 3) |
| `created_at` | timestamptz | Data de criação                |
| `updated_at` | timestamptz | Data de atualização            |

### Migrações

1. `20260426000000_create_entries.sql` — Tabela base + RLS + Storage policies
2. `20260426000001_rename_entries_to_registros.sql` — Rename para português
3. `20260426000002_add_event_date.sql` — Campo event_date customizável
4. `20260426000003_photo_urls_array.sql` — Array de fotos (substitui photo_url único)

## Setup Local

### Pré-requisitos

- Node.js 18+
- Docker (para Supabase local)
- Expo CLI (`npx expo`)
- EAS CLI (`npm i -g eas-cli`) — para builds

### Instalação

```bash
git clone <repo-url>
cd life-journal
npm install
```

### Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencher:

```env
EXPO_PUBLIC_SUPABASE_URL=http://<seu-ip>:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key-do-supabase-local>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

> **Nota:** Use o IP da rede local (ex: `192.168.1.x`) em vez de `127.0.0.1` no `SUPABASE_URL` para que o app funcione no dispositivo Android.

### Iniciar Supabase local

```bash
npx supabase start      # Primeira vez (baixa imagens Docker)
npx supabase db reset    # Aplica migrações + seed
```

### Rodar o app

```bash
npx expo start           # Dev server
# Pressionar 'w' para web, 'a' para Android (Expo Go)
```

### Build APK

```bash
# Na nuvem (recomendado, não precisa de Android SDK local)
eas build --platform android --profile preview

# Local (requer JDK 17 + Android SDK)
npm run build:apk
```

## Design System

Tema dark com glassmorphism e tons quentes. A paleta inteira é definida em `src/theme/tokens.ts` — para mudar o visual, basta alterar a paleta base.

### Cores das categorias

| Categoria | Cor      | Hex       |
| --------- | -------- | --------- |
| Eventos   | 🟠 Âmbar | `#E08A38` |
| Comida    | 🟢 Verde | `#4CAF50` |
| Pessoal   | 🔵 Azul  | `#5B8DEF` |

## Arquitetura

```
Rotas (app/) → Screens → Hooks → Services → Supabase
                  ↓          ↓
              Components   Stores (Zustand)
                  ↓
              UI primitives
```

- **Rotas** — Finas, só renderizam screens
- **Screens** — Compõem hooks + components
- **Hooks** — Orquestram services + stores
- **Services** — Comunicação com Supabase (auth, registros, storage)
- **Stores** — Estado global mínimo (Zustand)
- **Components UI** — Desacoplados de regra de negócio
- **Schemas** — Zod como fonte de verdade para validação

## Scripts

| Script                   | Descrição                    |
| ------------------------ | ---------------------------- |
| `npm start`              | Expo dev server              |
| `npm run web`            | Abre no navegador            |
| `npm run android`        | Abre no Android              |
| `npm run build:apk`      | Build APK local via EAS      |
| `npm run build:aab`      | Build AAB (production) local |
| `npm run supabase:start` | Inicia Supabase local        |
| `npm run supabase:stop`  | Para Supabase local          |
| `npm run supabase:reset` | Reset DB + aplica migrações  |

## Notas Técnicas

- **Tamagui RC**: Versão `2.0.0-rc.41` — `Stack` não é exportado, usar `YStack`/`XStack`/`View`
- **lucide-react-native**: Substituiu `@tamagui/lucide-icons` que conflitava com Tamagui RC. Tokens Tamagui (`$textSecondary`) não funcionam como `color` em ícones lucide — usar valores hex/rgba diretos
- **Web compat**: `expo-secure-store` → `localStorage` na web; `Alert.alert` → `alert()`/`confirm()`; `<input type="date/time">` para DateInput/TimeInput
- **ImageCarousel**: State-driven (não scroll-based) para compatibilidade web
- **Supabase local**: `db reset` apaga usuários auth — re-registrar após cada reset
