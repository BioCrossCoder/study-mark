import z from "zod";
import { ChatMessageSender } from "./enums";

export type ChatMessage = {
  sender: ChatMessageSender;
  message: string;
  timestamp: Date;
};

export const signalMessageSchema = z.object({
  type: z.literal("signal"),
  content: z.enum(["clear"]),
});

export type SignalMessage = z.infer<typeof signalMessageSchema>;
