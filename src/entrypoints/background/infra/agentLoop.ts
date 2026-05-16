import { MessageType, Signal } from "@/common/enums";
import { TextMessage } from "@/common/types";
import {
  AIMessage,
  AIMessageChunk,
  createAgent,
  HumanMessage,
} from "langchain";
import { err, ok, Result, ResultAsync } from "neverthrow";

export async function execAgentLoop(
  agent: ReturnType<typeof createAgent>,
  messages: (HumanMessage | AIMessage)[],
  abortController: AbortControllerInterface,
  send: (message: TextMessage) => void,
): Promise<Result<AIMessage | Signal.Stop, Error>> {
  // [CallLLM]
  const result = await ResultAsync.fromThrowable((messages) =>
    agent.stream({ messages }, { streamMode: "messages" }),
  )(messages);
  if (result.isErr()) {
    return err(result.error as Error);
  } // [/]
  abortController.init();
  const stream = result.unwrapOr(null)!;
  const responseChunks = new Array<AIMessageChunk>();
  for await (const [chunk] of stream) {
    // [AbortLoop]
    if (abortController.end()) {
      await stream.cancel();
      break;
    } // [/]
    // [SendToolCallingResult]
    if (chunk.type === "tool") {
      send({
        type: MessageType.Tool,
        content: chunk.content as string,
      });
      continue;
    } // [/]
    if (chunk.type !== "ai") {
      continue;
    }
    // [SendToolCallingIntention]
    const msg = chunk as AIMessageChunk;
    if (msg.tool_calls?.length) {
      send({
        type: MessageType.Tool,
        content: JSON.stringify(msg.tool_calls),
      });
      continue;
    }
    if (msg.tool_call_chunks?.length) {
      send({
        type: MessageType.Tool,
        content: JSON.stringify(msg.tool_call_chunks),
      });
      continue;
    }
    if (msg.invalid_tool_calls?.length) {
      send({
        type: MessageType.Tool,
        content: JSON.stringify(msg.invalid_tool_calls),
      });
      continue;
    } // [/]
    // [SendReasoningProcess]
    const reasoning = msg.additional_kwargs.reasoning_content;
    if (reasoning) {
      send({
        type: MessageType.Infer,
        content:
          typeof reasoning === "string" ? reasoning : JSON.stringify(reasoning),
      });
      continue;
    } // [/]
    // [SendTextMessage]
    const text = msg.content;
    if (text) {
      responseChunks.push(msg);
      send({
        type: MessageType.Text,
        content: typeof text === "string" ? text : JSON.stringify(text),
      });
    } // [/]
  }
  if (abortController.end()) {
    return ok(Signal.Stop);
  }
  abortController.stop();
  return ok(
    responseChunks.reduce((c1, c2) => c1.concat(c2), new AIMessageChunk("")),
  );
}

type AbortControllerInterface = {
  init: () => void;
  stop: () => void;
  end: () => boolean;
};

export function useAbortController() {
  let c: AbortController | null = null;
  function stop() {
    if (!c) {
      return;
    }
    c.abort();
    c = null;
  }
  function init() {
    c = new AbortController();
  }
  function end() {
    return c?.signal.aborted ?? false;
  }
  return {
    init,
    stop,
    end,
  };
}
