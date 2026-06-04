export const enum StoreKey {
  Task = "local:task",
  Target = "local:target",
  Library = "local:library",
  Relation = "local:relation",
  ChatHistory = "local:chatHistory",
  ChatLoading = "local:chatLoading",
  ModelConfig = "sync:modelConfig",
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
}

export const enum MessageID {
  SaveProgress = "SAVE_PROGRESS",
  LoadProgress = "LOAD_PROGRESS",
  ProgressUpdated = "PROGRESS_UPDATED",
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
