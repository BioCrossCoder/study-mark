# SIDEpanel KNOWLEDGE BASE

**Generated:** 2026-05-17

## OVERVIEW
Main workspace UI — tasks, favorites, chat. Largest entrypoint (3 pages, 14 components, 8 stores).

## STRUCTURE
```
sidepanel/
├── main.ts               # Vue app bootstrap (PrimeVue + Aura, VueQuery, Toast, Confirmation)
├── App.vine.ts           # Root component
├── router.ts             # Vue Router setup
├── index.html            # HTML shell
├── pages/                # File-based routes (.vine.ts)
│   ├── index.vine.ts     # Chat page (main landing)
│   ├── favorites.vine.ts # Bookmark favorites browser
│   └── tasks.vine.ts     # Task management
├── components/           # Reusable UI components (.vine.ts, 14 files)
│   ├── ChatWindow.vine.ts          # Chat message display (marked for MD)
│   ├── ChatConfigDialog.vine.ts    # AI model config dialog
│   ├── CreateBookmarkDialog.vine.ts
│   ├── CreateFolderDialog.vine.ts
│   ├── CreateResourceDialog.vine.ts
│   ├── CreateTargetDialog.vine.ts
│   ├── CreateTaskDialog.vine.ts
│   ├── DeleteBookmarksDialog.vine.ts
│   ├── FavoritesTree.vine.ts       # Bookmark tree view
│   ├── NavigationGroup.vine.ts     # Page navigation
│   ├── TaskData.vine.ts            # Task detail display
│   ├── UpdateResourceDialog.vine.ts
│   ├── UpdateTargetDialog.vine.ts
│   └── UpdateTaskDialog.vine.ts
├── stores/               # Entrypoint-scoped stores (8 files)
│   ├── bookmark.ts       # Vue Query hook for browser.bookmarks
│   ├── chat.ts           # defineVibe: history, loading
│   ├── connection.ts     # defineVibe: port connect/send/listen/close
│   ├── relatedItems.ts   # Vue Query hook for task/target relations
│   ├── resource.ts       # Vue Query hook for Resource type lookup
│   ├── selections.ts     # defineVibe: TreeSelectionKeys state
│   ├── target.ts         # Vue Query hook for Target type lookup
│   └── task.ts           # Vue Query hooks for Task type lookup
└── composables/          # Entrypoint-scoped composables (2 files)
    ├── usePathStore.ts   # Syncs router with persisted sidepanel path
    └── useShowTasks.ts   # Listens for Signal.ShowTasks → navigate to /tasks
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add new page | `pages/` | Auto-registered route, `.vine.ts` |
| Add UI component | `components/` | 14 Vine components, PrimeVue |
| Add sidepanel state | `stores/` | Mix of `defineVibe` (chat/connection/selection) and Vue Query hooks |
| Add shared logic | `composables/` | Path sync, signal routing |

## CONVENTIONS
- **Vue Vine** (`.vine.ts`) — TS functions with embedded `<template>`, NOT `.vue` SFCs
- **defineVibe** (vue-vine) for lightweight entrypoint-scoped reactive state — returns `[useX, initX]`
- **Vue Query hooks** (`useXQuery`) for data fetching from global stores — NOT Pinia
- **Port-based communication** to background via `connection.ts` store (`browser.runtime.connect`)
- **PrimeVue** components: Dialog, Button, InputText, Tree, TreeSelect, Toast, Toolbar, etc.
- **TailwindCSS v4** for layout
- **marked** for rendering markdown in chat responses

## ANTI-PATTERNS
- Do NOT import from `popup/` — entrypoints are isolated bundles
- Do NOT use `.vue` files — only `.vine.ts`
- Do NOT use `defineStore` (Pinia) — use `defineVibe` or Vue Query hooks
- Do NOT duplicate global store logic — use `@/stores/*` for cross-entrypoint state
- `handleClear()` in `pages/index.vine.ts` lacks confirmation dialog (TODO noted)
