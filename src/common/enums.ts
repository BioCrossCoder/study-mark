export const enum Channel {
  SidePanel = "side-panel",
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
