# Project Guidelines

## Architecture

Life Journal is an Expo (SDK 54) + React Native app with Supabase backend (Auth, PostgreSQL, Storage). It uses Tamagui for UI, Zustand for state, React Hook Form + Zod for forms, and lucide-react-native for icons.

### Layer Responsibilities

- **`app/`** — Route files must be thin: only import and render the corresponding screen from `src/screens/`
- **`src/screens/`** — Compose hooks + components. No direct Supabase calls
- **`src/hooks/`** — Orchestrate services + stores. Business logic lives here
- **`src/services/`** — All Supabase communication (auth, registros, storage). Pure async functions, no React
- **`src/stores/`** — Zustand stores with minimal global state. No business logic
- **`src/components/ui/`** — Reusable primitives. No business logic, no service calls
- **`src/components/registro/`** — Domain components for registro CRUD
- **`src/schemas/`** — Zod schemas are the source of truth for validation
- **`src/types/`** — Shared TypeScript interfaces
- **`src/theme/`** — Design tokens and Tamagui config. All colors derive from `tokens.ts` palette
- **`src/lib/`** — Utilities, constants, Supabase client

### Data Flow

```
Route → Screen → Hook → Service → Supabase
                   ↕
                 Store (Zustand)
```

## Code Style

- TypeScript strict mode (`strict: true` in tsconfig)
- Path alias `@/*` maps to `./src/*`
- Portuguese for domain terms: `registro`, `registros` (not entry/entries)
- Portuguese for UI-facing strings and comments
- English for code identifiers, types, and variable names
- Functional components with hooks, no class components
- Named exports for components and services; default export only for screens and layouts

## Tamagui Specifics

- Version `2.0.0-rc.41` (Release Candidate) — some APIs differ from stable docs
- `Stack` is NOT exported from Tamagui RC. Use `YStack`, `XStack`, or `View` instead
- Theme tokens like `$textSecondary` work in Tamagui components but NOT as `color` prop in lucide-react-native icons — use raw hex/rgba values from `src/theme/tokens.ts` for icon colors
- Tamagui `Image` has width issues on web — use React Native `Image` with `style` prop instead
- Always import from `tamagui` or `@tamagui/core`, not from `@tamagui/config` for components

## Icons

- Use `lucide-react-native` (NOT `@tamagui/lucide-icons` which conflicts with Tamagui RC)
- Icon type: `ComponentType<{ size?: number; color?: string }>`
- For dynamic icon rendering, use `createElement(icon, { size, color })` from React
- Available icons in use: `CalendarCheck`, `UtensilsCrossed`, `User`, `ChevronDown`, `X`, `ChevronLeft`, `ChevronRight`, `Calendar`, `Clock`, `Check`

## Web Compatibility

When code needs to work on both mobile and web:

- `expo-secure-store` → use `globalThis.localStorage` on web (already handled in `src/lib/supabase.ts`)
- `Alert.alert()` → use `alert()` / `confirm()` on web with `Platform.OS` check
- Date/Time inputs → `<input type="date">` / `<input type="time">` on web, native pickers on mobile
- ScrollView-based carousels are unreliable on web — use state-driven approach with buttons

## Database

- Table name: `registros` (renamed from `entries`)
- RLS enabled on all operations — policies restrict by `auth.uid() = user_id`
- Migrations in `supabase/migrations/` — apply with `npx supabase db reset`
- `db reset` wipes auth users — need to re-register after each reset
- Photo storage: bucket `entry-photos`, path pattern `{user_id}/{timestamp}.jpg`

## Build and Test

```bash
# Development
npx expo start              # Dev server (press 'w' for web, 'a' for Android)

# Supabase local
npx supabase start          # Start local Supabase (Docker)
npx supabase db reset       # Reset + apply migrations

# Build
eas build --platform android --profile preview   # APK (cloud)
npm run build:apk                                 # APK (local, needs JDK 17 + Android SDK)
```

## Conventions

- Category colors are constants in `src/lib/constants.ts` — never hardcode category colors
- All form validation uses Zod schemas from `src/schemas/` — never validate inline
- The palette in `src/theme/tokens.ts` is the single source of truth for all colors
- Semantic color names from `colors` object, not raw palette values in components
- Services throw errors on failure — hooks catch and handle them
- Zustand stores use the pattern: `useXxxStore` with `set()` actions
- Hook naming: `useRegistros`, `useAuth`, `useImagePicker`
- Service naming: `registroService`, `authService`, `storageService`

## Environment

- Supabase URL must use LAN IP (e.g., `192.168.1.x:54321`) for Android device access, not `127.0.0.1`
- `.env` is gitignored — copy `.env.example` and fill values
- EAS project ID: `684ae3db-0169-4872-b550-55ed260a086d`
- Android package: `com.danielbizarro.lifejournal`
