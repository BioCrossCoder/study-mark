import z from "zod";
import {
  bookmarkSchema,
  chatMessageSchema,
  librarySchema,
  modelConfigSchema,
  planSchema,
  targetSchema,
  taskSchema,
} from "./schemas";
import type { LanguageCode } from "iso-639-1";
import { AgentMode } from "./enums";

export type Bookmark = z.infer<typeof bookmarkSchema>;

export type Task = z.infer<typeof taskSchema>;

export type Target = z.infer<typeof targetSchema>;

export type Library = z.infer<typeof librarySchema>;

export type Relation = {
  taskId: string;
  targetId: string;
};

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

export type ModelConfig = z.infer<typeof modelConfigSchema>;

export type Plan = z.infer<typeof planSchema>;

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export type ChatHumanMessage = {
  type: "human";
  content: string;
};

export type ChatAIMessage = {
  type: "ai";
  mode: AgentMode;
  content: ChatAIMessageItem[];
};

export type ChatAITextMessage = {
  type: "text";
  content: string;
};

export type ChatAIReasoningMessage = {
  type: "think";
  content: string;
  loading: boolean;
};

export type ChatToolCallingMessage = {
  type: "tool";
  name: string;
  params: string;
  result: string;
  loading: boolean;
  fullResult: boolean;
};

export type ChatAIMessageItem =
  | ChatAITextMessage
  | ChatAIReasoningMessage
  | ChatToolCallingMessage;

export type ChatHistoryMessage = ChatHumanMessage | ChatAIMessage;

export type Comment = {
  url: string;
  xpath: string;
  content: string;
};
