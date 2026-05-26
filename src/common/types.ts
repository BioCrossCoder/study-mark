import z from "zod";
import {
  bookmarkSchema,
  librarySchema,
  targetSchema,
  taskSchema,
} from "./schemas";

export type Bookmark = z.infer<typeof bookmarkSchema>;

export type Task = z.infer<typeof taskSchema>;

export type Target = z.infer<typeof targetSchema>;

export type Library = z.infer<typeof librarySchema>;

export type Relation = {
  taskId: string;
  targetId: string;
};
