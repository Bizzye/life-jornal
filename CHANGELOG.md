# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Authentication with Supabase Auth (email/password)
- CRUD for registros (entries) with categories: event, food, personal
- Photo upload to Supabase Storage (up to 3 photos per entry)
- Daily timeline with SectionList grouped by day
- Calendar view with month grid and week strip
- Protected routes with auth guard
- Row Level Security on all database operations
- Web compatibility (DateInput, TimeInput, localStorage fallback)
- Dark theme with glassmorphism design system (Tamagui)
- EAS Build configuration for Android (preview + production)
- CI workflow with TypeScript typecheck
- OTA update workflow via EAS Update
- AI-ready configuration (AGENTS.md, copilot-instructions, 31 agents, 14 instructions)
