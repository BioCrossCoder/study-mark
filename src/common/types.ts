import z from "zod";
import { ChatMessageSender, ExecStatus } from "./enums";

export type ChatMessage = {
  sender: ChatMessageSender;
  message: string;
  timestamp: Date;
};

export const signalMessageSchema = z.object({
  type: z.literal("signal"),
  content: z.enum(["clear", "finish"]),
});

export type SignalMessage = z.infer<typeof signalMessageSchema>;

export const textMessageSchema = z.object({
  type: z.literal("text"),
  content: z.string(),
});

export type TextMessage = z.infer<typeof textMessageSchema>;

export type Task = {
  id: string;
  title: string;
  state: ExecStatus;
  description: string;
  source: string;
  position: string;
};

export type Target = {
  id: string;
  title: string;
  state: ExecStatus;
  description: string;
};

export function isTask(item: Task | Target): item is Task {
  return Object.hasOwn(item, "source");
}
