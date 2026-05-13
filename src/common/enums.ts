export const enum Channel {
  SidePanel = "side-panel",
}

export const enum MessageType {
  Signal,
  Text,
  Error,
}

export enum Signal {
  Clear,
  Finish,
  UpdateTask,
  ShowTasks,
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

export const enum PlanType {
  Task,
  Target,
}

export enum ModelProviderProtocol {
  OpenAI = "openai",
  Anthropic = "anthropic",
  Google = "google",
}

export const enum ToolName {
  WebSearch = "web_search",
}
