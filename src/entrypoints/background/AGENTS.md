# BACKGROUND KNOWLEDGE BASE

**Generated:** 2026-05-17

## OVERVIEW
Service worker — AI agent loop (LangGraph), message routing, port management, context menu for DOM markers.

## STRUCTURE
```
background/
├── index.ts              # defineBackground(), port connections, message routing, context menu
├── agents/               # LangGraph agent definitions
│   ├── chatbot.ts        # Study guidance chatbot (web search, trim/sum middleware, history)
│   └── planner.ts        # Learning planner (structured output via toolStrategy, 3 retries)
├── tools/                # Agent-callable tools
│   ├── webSearch.ts      # Tavily search (createWebSearchTool, Zod schema)
│   └── loadResources.ts  # Loads Resource items from taskData store
├── middlewares/          # LangGraph middleware
│   ├── trimMessages.ts   # Token-based message trimming with accurate token counter
│   └── sumMessages.ts    # Summarization middleware (trigger: 12.8K tokens or 20 msgs)
├── infra/                # Core infrastructure
│   ├── agentLoop.ts      # execAgentLoop (streaming, abort, message dispatch) + useAbortController
│   └── modelAdapter.ts   # createModelAdapter (OpenAI/Anthropic/Google factory)
└── stores/               # Background-scoped state
    └── chat.ts           # chatContext: session-scoped HumanMessage/AIMessage array
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add AI agent | `agents/` | LangGraph state machine via `createAgent()` |
| Add agent tool | `tools/` | Zod-validated, callable by agents |
| Add middleware | `middlewares/` | Message trimming, summarization |
| Add LLM provider | `infra/modelAdapter.ts` | Add case to switch for new provider |
| Modify agent loop | `infra/agentLoop.ts` | Streaming, abort, message type dispatch |
| Context menu | `index.ts` | `browser.contextMenus.create/onClicked` |

## CONVENTIONS
- **LangGraph** via `createAgent()` from `langchain` — not raw LangChain chains
- **Zod v4** for tool input/output schemas
- **neverthrow** for error handling — `Result`/`Err`/`Ok`/`ResultAsync`
- **execAgentLoop** handles: LLM streaming, abort control, tool call signals, reasoning content, text chunks
- **useAbortController** — init/stop/end pattern for agent cancellation
- Background runs as Chrome **service worker** — no DOM access
- Communication via `browser.runtime.connect` ports with sidepanel, `browser.runtime.onMessage` for popup
- Context menu "插入标记" sends `InsertMarker` message to content script

## ANTI-PATTERNS
- Do NOT use `window`/`document` — service worker context only
- Do NOT store secrets in code — use `env.json` (gitignored)
- Agent tools must have Zod schemas — no untyped inputs
- Do NOT bypass `execAgentLoop` — it handles streaming, abort, and message dispatch

## NOTES
- Service worker can be terminated by Chrome — state must be resilient (use `storage.defineItem`)
- `env.json` contains SiliconFlow + Tavily API keys
- `chatContext` uses `session:` prefix — cleared on browser restart
- `maxTokens` = 12,800 (40% of 32K) — used by trim/sum middlewares
