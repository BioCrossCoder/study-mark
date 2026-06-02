import z from "zod";
import { ExecStatus } from "./enums";

const nonEmptyStringSchema = z.string().refine((val) => val.trim() !== "");

export const bookmarkSchema = z.object({
  id: z.string(),
  xpath: z.string(),
  offset: z.number(),
});

export const taskSchema = z.object({
  id: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  status: z.enum(ExecStatus),
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
  status: z.enum(ExecStatus),
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
