import z from "zod";
import {
  ChatMessageSender,
  ExecStatus,
  MessageType,
  ModelProviderProtocol,
  ObjectType,
  Signal,
} from "./enums";
import { RouteLocationAsString } from "vue-router";
import type { LanguageCode } from "iso-639-1";

export type ChatMessage = {
  sender: ChatMessageSender;
  message: string;
  timestamp: Date;
  callback?: () => void;
};

export const signalMessageSchema = z.object({
  type: z.literal(MessageType.Signal),
  content: z.enum(Signal),
});

export type SignalMessage = z.infer<typeof signalMessageSchema>;

export const textMessageSchema = z.object({
  type: z.enum([MessageType.Text, MessageType.Plan, MessageType.Infer]),
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
  type: z.literal(ObjectType.Task),
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
  type: z.literal(ObjectType.Target),
  title: z.string().min(1),
  state: z.enum(ExecStatus),
  description: z.string(),
  createAt: z.number(),
});

export type Target = z.infer<typeof targetSchema>;

export const resourceSchema = z.object({
  id: z.string(),
  type: z.literal(ObjectType.Resource),
  title: z.string().min(1),
  description: z.string(),
  source: z.url(),
  createAt: z.number(),
});

export type Resource = z.infer<typeof resourceSchema>;

export const modelConfigSchema = z.object({
  protocol: z.enum(ModelProviderProtocol),
  baseURL: z.url(),
  apiKey: z.string().min(1),
  model: z.string().min(1),
  tavilyApiKey: z.string(),
});

export type ModelConfig = z.infer<typeof modelConfigSchema>;

export type SidePanelPagePath = RouteLocationAsString & `/sidepanel${string}`;

type MicroLinkApiSuccessResp = {
  status: "success";
  data: {
    title: string;
    description: string | null;
    lang: LanguageCode;
  };
};

type MicroLinkApiFailureResp = {
  status: "fail" | "error";
  message: string;
};

// https://microlink.io/docs/api/getting-started/data-fields
export type MicroLinkApiResp =
  | MicroLinkApiSuccessResp
  | MicroLinkApiFailureResp;

export const planSchema = z.object({
  target: z.object({
    title: z.string().min(1),
    description: z.string(),
  }),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        source: z.url(),
      }),
    )
    .min(1),
});

export type Plan = z.infer<typeof planSchema>;
