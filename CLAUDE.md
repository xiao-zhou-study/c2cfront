# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

校园物品共享平台 (Campus Item Sharing Platform) - A Vue 3 campus marketplace for sharing, borrowing, and trading items among students.

## Tech Stack

- Vue 3.5.24 (Composition API with `<script setup>`)
- Vite 7.2.4
- Element Plus 2.12.0 (UI framework)
- Pinia 2.2.6 (state management)
- Vue Router 4.6.4
- Axios (HTTP client)
- TypeScript

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Type-check + production build
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking only
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting
```

## Architecture

### Module-Based Structure

Code is organized by feature modules under `src/modules/`. Each module contains its own components, views, composables, and router:

```
src/modules/
├── auth/           # Login, Register, password reset
├── dashboard/      # Home/landing page
├── items/         # Item listing, detail, publishing
├── profile/       # User profile, settings, my items
├── blog/          # Campus discussions
├── search/        # Search functionality
├── review/        # Rating and review system
├── orders/        # Order/trading management
├── announcements/ # System announcements
└── common/        # Shared views (Help, About, Feedback, 404)
```

### Shared Resources (`src/shared/`)

- `api/` - Axios-based API layer with interceptors
  - `request.ts` - Core axios instance with auth token handling, automatic refresh, and 401 retry queue
  - `modules/` - API endpoints grouped by domain (auth, item, user, etc.)
- `stores/` - Pinia stores
  - `user.ts` - User auth state, token management, multi-tab sync
  - `app.ts` - App-wide state (loading, device type)
- `components/` - Reusable components (Layout, UnifiedItemCard, etc.)
- `utils/` - Utility functions (validation, formatting, storage, debounce)
- `types/` - TypeScript type definitions

### Layout System

`src/shared/components/Layout.vue` provides the main app shell with:
- Responsive header (mobile hamburger vs desktop horizontal nav)
- Notification center dropdown
- Page loading overlay
- Router-view content area with page transition animations

### Routing

Routes are modularized in `src/router/routes/` and assembled in `src/router/index.ts`. The router implements:
- Auth guards with token refresh on 401
- Multi-tab logout sync via `tabSyncManager`
- Page title management
- Scroll-to-top on navigation

### API Design

The backend uses a Gateway pattern with service-specific path prefixes:
- `/as/*` - Account/Auth Service
- `/is/*` - Item Service
- `/us/*` - User Service
- `/os/*` - Order Service
- `/ns/*` - Notification Service
- `/bs/*` - Blog Service

API responses follow `{ code: 0, data: ..., msg: string }` format. The request interceptor auto-injects `Authorization` headers and handles proactive token refresh.

### State Management

User store (`user.ts`) manages:
- JWT token in localStorage
- Token expiration parsing and proactive refresh (2 min before expiry)
- Multi-tab sync via `BroadcastChannel`/`localStorage` events
- Login/logout/fetchUserInfo actions

## Development Conventions

- Path alias: `@/` maps to `src/`
- Single quotes, no semicolons, 2-space indent
- TypeScript: `strict: false`, `noImplicitAny: false`
- Component files: PascalCase `.vue` files
- Composables: camelCase with `use` prefix (e.g., `useItemList.js`)
- API modules use named exports (e.g., `export function getItemList()`)

## Environment Variables

```env
VITE_APP_TITLE=校园物品共享平台
VITE_API_BASE_URL=https://api.xzxfle.top
VITE_API_TIMEOUT=10000
```

Dev server proxies `/api/*` to `http://127.0.0.1:10010` and strips the `/api` prefix.
