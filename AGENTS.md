# Life Journal

Personal mobile journal app focused on progress tracking and daily history. Record daily events organized by categories, with a daily timeline, calendar view, and premium visual experience.

## Tech Stack

| Layer      | Technology                             | Version          |
| ---------- | -------------------------------------- | ---------------- |
| Framework  | React Native + Expo                    | SDK 54           |
| UI         | Tamagui                                | 2.0.0-rc.41      |
| Navigation | Expo Router                            | 6.x              |
| Backend    | Supabase (Auth + PostgreSQL + Storage) | local via Docker |
| Forms      | React Hook Form + Zod                  | RHF 7.x, Zod 4.x |
| State      | Zustand                                | 5.x              |
| Icons      | lucide-react-native                    | 1.x              |
| Language   | TypeScript (strict)                    | 5.9              |
| Build      | EAS Build                              | eas-cli 18.x     |

## Repository Structure

```
life-journal/
├── app/                    # Routes (Expo Router) — thin layer, renders screens
│   ├── _layout.tsx         # Root: TamaguiProvider + AuthInit + ProtectedRoute
│   ├── (auth)/             # Auth route group (login, register)
│   └── (tabs)/             # Main tabs (index, calendar, new, profile)
├── src/
│   ├── components/
│   │   ├── auth/           # LoginForm, RegisterForm
│   │   ├── calendar/       # DayCell, DayDetailList, MonthGrid, WeekStrip
│   │   ├── entry/          # EntryCard, EntryForm, EntryList
│   │   ├── layout/         # Header, ScreenContainer
│   │   └── ui/             # Button, Chip, DateInput, FAB, GlassCard,
│   │                       # ImageCarousel, Input, LoadingOverlay,
│   │                       # Select, TextArea, TimeInput
│   ├── hooks/              # useAuth, useEntries, useCalendarEntries,
│   │                       # useImagePicker, useProtectedRoute
│   ├── lib/                # supabase client, constants, utils
│   ├── schemas/            # Zod schemas (auth, entry)
│   ├── screens/            # Full screen compositions
│   ├── services/           # auth.service, entry.service, storage.service
│   ├── stores/             # Zustand stores (auth.store, entry.store)
│   ├── theme/              # tokens.ts (palette + semantic colors), tamagui.config.ts
│   └── types/              # Registro, UserProfile, Category
├── supabase/
│   ├── config.toml         # Local Supabase config
│   └── migrations/         # SQL migrations (5 files)
├── docker/                 # Docker Compose for local Supabase
├── docs/                   # PROMPT.md (master plan), SETUP.md (setup guide)
├── scripts/                # Seed scripts for photos
├── .github/
│   ├── copilot-instructions.md   # AI coding conventions
│   ├── agents/             # 31 custom Copilot agents
│   ├── instructions/       # 14 instruction files
│   └── workflows/          # CI, Android build, OTA update
├── app.json                # Expo config
├── eas.json                # EAS Build profiles
├── tsconfig.json           # TypeScript strict + path alias @/*
└── package.json            # Dependencies and scripts
```

## Build & Run

### Prerequisites

- Node.js 20+
- Docker (for local Supabase)
- Expo CLI (`npx expo`)
- EAS CLI (`npm i -g eas-cli`) — for builds

### Install Dependencies

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Fill in:
# EXPO_PUBLIC_SUPABASE_URL=http://<your-lan-ip>:54321
# EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

> Use your LAN IP (e.g., `192.168.1.x`) instead of `127.0.0.1` for `SUPABASE_URL` so Android devices can connect.

### Start Local Supabase

```bash
npx supabase start          # First time downloads Docker images
npx supabase db reset       # Apply migrations (wipes auth users)
```

### Run the App

```bash
npx expo start              # Dev server
# Press 'w' for web, 'a' for Android (Expo Go)
```

### Build APK

```bash
# Cloud (recommended)
eas build --platform android --profile preview

# Local (requires JDK 17 + Android SDK)
npm run build:apk
```

## Testing

No test runner is currently configured. TypeScript type-checking serves as the primary validation:

```bash
npx tsc --noEmit            # Type-check the entire project
```

## Key Patterns and Conventions

### Architecture (Data Flow)

```
Route (app/) → Screen → Hook → Service → Supabase
                  ↕          ↕
              Components   Store (Zustand)
```

- **Routes** — Thin wrappers that render screens. No logic.
- **Screens** — Compose hooks + components. No direct Supabase calls.
- **Hooks** — Orchestrate services + stores. Business logic lives here.
- **Services** — Pure async functions for Supabase communication. No React.
- **Stores** — Zustand with minimal global state. No business logic.
- **Components UI** — Reusable primitives. No business logic or service calls.
- **Schemas** — Zod as the single source of truth for validation.

### Language Rules

- **Portuguese** for domain terms: `registro`, `registros` (not entry/entries)
- **Portuguese** for UI-facing strings and comments
- **English** for code identifiers, types, and variable names

### Naming Conventions

- Hooks: `useAuth`, `useEntries`, `useImagePicker`
- Services: `authService`, `entryService`, `storageService`
- Stores: `useAuthStore`, `useEntryStore`
- Components: PascalCase, named exports
- Screens/Layouts: default export only

### Tamagui Specifics

- Version `2.0.0-rc.41` — some APIs differ from stable docs
- `Stack` is NOT exported. Use `YStack`, `XStack`, or `View`
- Theme tokens (`$textSecondary`) do NOT work as `color` prop in lucide icons — use raw hex values from `src/theme/tokens.ts`
- Tamagui `Image` has width issues on web — use React Native `Image` with `style` prop

### Icons

- Use `lucide-react-native` (NOT `@tamagui/lucide-icons`)
- Icon type: `ComponentType<{ size?: number; color?: string }>`
- For dynamic rendering: `createElement(icon, { size, color })`

## Database

Table `registros` in PostgreSQL (via Supabase):

| Column       | Type        | Description                    |
| ------------ | ----------- | ------------------------------ |
| `id`         | uuid        | PK, auto-generated             |
| `user_id`    | uuid        | FK to auth.users               |
| `category`   | text        | `event`, `food`, or `personal` |
| `title`      | text        | Entry title                    |
| `body`       | text        | Description (optional)         |
| `event_date` | timestamptz | Event date/time                |
| `photo_urls` | text[]      | Array of photo URLs (max 3)    |
| `created_at` | timestamptz | Created timestamp              |
| `updated_at` | timestamptz | Updated timestamp              |

- RLS enabled — all policies restrict by `auth.uid() = user_id`
- Photo storage: bucket `entry-photos`, path `{user_id}/{timestamp}.jpg`
- `db reset` wipes auth users — re-register after each reset

## CI/CD

| Workflow            | Trigger           | Purpose                                      |
| ------------------- | ----------------- | -------------------------------------------- |
| `ci.yml`            | PR + push to main | TypeScript typecheck + EAS config validation |
| `build-android.yml` | Manual dispatch   | Trigger EAS cloud build (preview/production) |
| `ota-update.yml`    | Manual dispatch   | Publish OTA update via EAS Update            |

## Adding a New Feature

### Adding a New Screen

1. Create the screen component in `src/screens/NewScreen.tsx` (default export)
2. Create the route file in `app/(tabs)/new-route.tsx` — import and render the screen
3. If the screen needs data, create a hook in `src/hooks/useNewData.ts`
4. If it calls Supabase, create/extend a service in `src/services/`
5. Add the tab to `app/(tabs)/_layout.tsx` with icon from lucide-react-native
6. Update `src/types/index.ts` if new data types are needed

### Adding a New Category

1. Add the category value to the `Category` type in `src/types/index.ts`
2. Add it to `CATEGORIES` array in `src/lib/constants.ts`
3. Add the category config (label, color, icon) to `CATEGORY_CONFIG` in `src/lib/constants.ts`
4. Add the semantic color to `src/theme/tokens.ts` (`colors` object)
5. Update the Zod schema in `src/schemas/entry.schema.ts`
6. No database migration needed — `category` is a text column

### Adding a New Service

1. Create `src/services/newThing.service.ts` with pure async functions
2. Create a hook `src/hooks/useNewThing.ts` that orchestrates the service
3. If global state is needed, create `src/stores/newThing.store.ts`
4. Export types from `src/types/index.ts`

## Common Pitfalls

- **Supabase URL**: Must use LAN IP for Android device access, not `127.0.0.1`
- **Category colors**: Always use constants from `src/lib/constants.ts` — never hardcode
- **Tamagui Stack**: Does not exist in RC. Use `YStack`/`XStack`/`View`
- **Icon colors**: Cannot use Tamagui tokens (`$color`) — use hex values from `tokens.ts`
- **Web compatibility**: `Alert.alert()` doesn't work on web — use `Platform.OS` check
- **After `db reset`**: Auth users are wiped — must re-register
- **Expo Router**: Route files in `app/` must be thin — all logic in `src/screens/`
