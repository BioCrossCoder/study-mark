import z from "zod";
import {
  ChatMessageSender,
  ExecStatus,
  MessageType,
  ModelProviderProtocol,
  PlanType,
  Signal,
} from "./enums";
import { RouteLocationAsString } from "vue-router";

export type ChatMessage = {
  sender: ChatMessageSender;
  message: string;
  timestamp: Date;
};

export const signalMessageSchema = z.object({
  type: z.literal(MessageType.Signal),
  content: z.enum(Signal),
});

export type SignalMessage = z.infer<typeof signalMessageSchema>;

export const textMessageSchema = z.object({
  type: z.literal(MessageType.Text),
  content: z.string(),
});

export type TextMessage = z.infer<typeof textMessageSchema>;

export const errorMessageSchema = z.object({
  type: z.literal(MessageType.Error),
  content: z.string(),
});

export type ErrorMessage = z.infer<typeof errorMessageSchema>;

export const taskSchema = z.object({
  id: z.string(),
  type: z.literal(PlanType.Task),
  title: z.string().min(1),
  state: z.enum(ExecStatus),
  description: z.string(),
  source: z.url(),
  position: z.url(),
  createAt: z.number(),
});

export type Task = z.infer<typeof taskSchema>;

export const targetSchema = z.object({
  id: z.string(),
  type: z.literal(PlanType.Target),
  title: z.string().min(1),
  state: z.enum(ExecStatus),
  description: z.string(),
  createAt: z.number(),
});

export type Target = z.infer<typeof targetSchema>;

export const modelConfigSchema = z.object({
  protocol: z.enum(ModelProviderProtocol),
  baseURL: z.url(),
  apiKey: z.string().min(1),
  model: z.string().min(1),
  tavilyApiKey: z.string(),
});

export type ModelConfig = z.infer<typeof modelConfigSchema>;

export type SidePanelPagePath = RouteLocationAsString & `/sidepanel${string}`;
