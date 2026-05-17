# GLOBAL STORES

**Generated:** 2026-05-17

## OVERVIEW
Cross-entrypoint state management — WXT `storage.defineItem` + TanStack Vue Query (NOT Pinia).

## STRUCTURE
| Store | File | Key | Purpose |
|-------|------|-----|---------|
| `config` | `config.ts` | `sync:modelConfig` | AI model config (provider, baseURL, apiKey, model, tavilyApiKey) |
| `favorites` | `favorites.ts` | (browser API) | Bookmark tree query + live event listeners → PrimeVue TreeNode format |
| `relations` | `relations.ts` | `local:relationData` | Knowledge graph `[id1, id2][]` pairs with add/remove/dedup |
| `sidePanel` | `sidePanel.ts` | `local:sidePanelPath` | Last-visited sidepanel path for navigation restore |
| `target` | `target.ts` | (derived) | Derived query: Target options dropdown from taskData |
| `tasks` | `tasks.ts` | `local:taskData` | Primary store: Task/Target/Resource records with save/remove/newId |

## CONVENTIONS
- **NOT Pinia** — no `defineStore` anywhere
- **Query pattern**: `useXxxQuery()` returns `useQuery({ queryKey, queryFn })`
- **Mutation pattern**: `useXxxMutation()` returns `useMutation` + custom methods (`save`, `remove`, `newId`)
- **Storage keys**: `sync:` = browser-synced across devices, `local:` = device-only
- **Fallback values**: every `storage.defineItem` has a `fallback` (never undefined)
- **Refetch on success**: mutations call `refetch()` in `onSuccess` callback

## ANTI-PATTERNS
- Do NOT use `defineStore` (Pinia) — use `storage.defineItem` + Vue Query
- Do NOT duplicate state here AND in entrypoint-scoped stores — pick one source of truth
- Do NOT add DOM-dependent logic — stores run in service worker context too
- `favorites.ts` uses `browser.bookmarks` API — only works in extension contexts (not background)
- `sync:` prefix = browser-synced storage (config), `local:` = device-only (tasks, relations)
