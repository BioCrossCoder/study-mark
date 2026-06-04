import z from "zod";
import { AgentMode, ExecStatus, ModelProviderProtocol, Signal } from "./enums";

const nonEmptyStringSchema = z.string().refine((val) => val.trim() !== "");

export const bookmarkSchema = z.object({
  id: z.string(),
  xpath: z.string(),
  offset: z.number(),
});

export const statusSchema = z.enum(ExecStatus);

export const taskSchema = z.object({
  id: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  status: statusSchema,
  description: z.string(),
  source: z.url(),
  position: z.object({
    url: z.url(),
    bookmark: bookmarkSchema.optional(),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastVisit: z.number(),
});

export const targetSchema = z.object({
  id: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  status: statusSchema,
  description: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const librarySchema = z.object({
  id: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  description: z.string(),
  source: z.url(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const modelConfigSchema = z.object({
  protocol: z.enum(ModelProviderProtocol),
  baseURL: z.url(),
  apiKey: nonEmptyStringSchema,
  model: nonEmptyStringSchema,
});

export const planSchema = z.object({
  target: z.object({
    name: nonEmptyStringSchema,
    description: z.string(),
  }),
  tasks: z
    .array(
      z.object({
        name: nonEmptyStringSchema,
        description: z.string(),
        source: z.url(),
      }),
    )
    .min(1),
});

export const chatMessageSchema = z.object({
  mode: z.enum(AgentMode),
  message: nonEmptyStringSchema,
});

export const signalSchema = z.enum(Signal);
