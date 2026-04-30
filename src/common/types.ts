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

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  state: z.enum(ExecStatus),
  description: z.string(),
  source: z.url(),
  position: z.url(),
});

export type Task = z.infer<typeof taskSchema>;

export const targetSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  state: z.enum(ExecStatus),
  description: z.string(),
});

export type Target = z.infer<typeof targetSchema>;

export function isTask(item: Task | Target): item is Task {
  return Object.hasOwn(item, "source");
}
