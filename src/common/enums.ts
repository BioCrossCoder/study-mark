export const enum StoreKey {
  Task = "local:task",
  Target = "local:target",
  Library = "local:library",
  Relation = "local:relation",
  ChatHistory = "local:chatHistory",
  ChatLoading = "local:chatLoading",
  ModelConfig = "sync:modelConfig",
  TabIndex = "local:tabIndex",
  Comment = "local:comment",
}

export enum ExecStatus {
  Todo = "todo",
  Doing = "doing",
  Done = "done",
}

export const statusIcon = {
  [ExecStatus.Todo]: "pi pi-clock",
  [ExecStatus.Doing]: "pi pi-spinner",
  [ExecStatus.Done]: "pi pi-check-circle",
};

export const enum ContextMenuItemID {
  UpdateProgress = "study-mark-update-progress",
  AddComment = "study-mark-add-comment",
}

export const enum MessageID {
  SaveProgress = "SAVE_PROGRESS",
  LoadProgress = "LOAD_PROGRESS",
  GotoProgress = "GOTO_PROGRESS",
  AddComment = "ADD_COMMENT",
  LoadComment = "LOAD_COMMENT",
}

export enum ModelProviderProtocol {
  OpenAI = "openai",
  Anthropic = "anthropic",
}

export enum AgentMode {
  Chat,
  Plan,
}

export enum Signal {
  Stop,
}

export enum ToolName {
  // [Exa MCP] https://exa.ai/docs/reference/exa-mcp#available-tools
  WebSearch = "web_search_exa",
  WebFetch = "web_fetch_exa", // [/]
  LoadLibrary = "load_library",
}

export const enum TabIndex {
  Plan,
  List,
}
