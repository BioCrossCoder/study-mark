export const enum Channel {
  SidePanel = "side-panel",
}

export enum MessageType {
  Signal = "signal",
  Text = "text",
  Error = "error",
  Plan = "plan",
  Infer = "infer",
  Tool = "tool",
}

export enum Signal {
  Clear,
  Finish,
  UpdateTask,
  ShowTasks,
  Stop,
  Tool,
  SaveProgress,
  Bookmark,
}

export const enum ChatMessageSender {
  User = "pi pi-user",
  Robot = "pi pi-microchip-ai",
}

export enum ExecStatus {
  Todo,
  Doing,
  Done,
}

export const statusIcon = {
  [ExecStatus.Todo]: "pi pi-clock",
  [ExecStatus.Doing]: "pi pi-spinner",
  [ExecStatus.Done]: "pi pi-check-circle",
};

export const enum ObjectType {
  Task,
  Target,
  Resource,
}

export enum ModelProviderProtocol {
  OpenAI = "openai",
  Anthropic = "anthropic",
  Google = "google",
}

export const enum ToolName {
  WebSearch = "web_search",
  SearchFavorites = "search_favorites",
  LoadResources = "load_resources",
}

export const enum AgentMode {
  Chat,
  Plan,
}

export const enum ContextMenuItemID {
  RecordProgress = "study-mark-record-progress",
}

export const enum ConnectionListener {
  ChatWindow,
  TaskData,
}
