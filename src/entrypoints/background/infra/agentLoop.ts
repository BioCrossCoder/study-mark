import {
  ChatAIReasoningMessage,
  ChatAIMessageItem,
  ChatAITextMessage,
  ChatToolCallingMessage,
} from "@/common/types";
import {
  AIMessageChunk,
  BaseMessage,
  createAgent,
  ToolMessage,
  ToolMessageChunk,
} from "langchain";

export async function execAgentLoop(
  agent: ReturnType<typeof createAgent>,
  messages: BaseMessage[],
  abortController: AbortControllerInterface,
  send: (message: ChatAIMessageItem) => void,
) {
  const stream = await agent.stream({ messages }, { streamMode: "messages" });
  abortController.init();
  for await (const [chunk] of stream) {
    if (abortController.end()) {
      await stream.cancel();
      return;
    }

    if (AIMessageChunk.isInstance(chunk)) {
      const msg = chunk as AIMessageChunk;
      if (msg.additional_kwargs.reasoning_content) {
        send({
          type: "think",
          content: msg.additional_kwargs.reasoning_content,
          loading: true,
        } as ChatAIReasoningMessage);
      } else if (
        msg.tool_calls?.length ||
        msg.tool_call_chunks?.length ||
        msg.invalid_tool_calls?.length
      ) {
        const args = msg.tool_calls?.at(0)?.args;
        const toolCallArgs =
          args && Object.keys(args).length > 0
            ? JSON.stringify(args)
            : undefined;
        send({
          type: "tool",
          name:
            msg.tool_calls?.at(0)?.name ??
            msg.tool_call_chunks?.at(0)?.name ??
            "",
          params: toolCallArgs ?? msg.tool_call_chunks?.at(0)?.args ?? "",
          result: "",
          loading: true,
        } as ChatToolCallingMessage);
      } else if (msg.content.length > 0) {
        send({
          type: "text",
          content: msg.content,
        } as ChatAITextMessage);
      }
    } else if (ToolMessageChunk.isInstance(chunk)) {
      const msg = chunk as ToolMessageChunk;
      send({
        type: "tool",
        params: "",
        result: msg.contentBlocks.at(0)?.output ?? "",
        loading: true,
      } as ChatToolCallingMessage);
    } else if (ToolMessage.isInstance(chunk)) {
      const msg = chunk as ToolMessage;
      send({
        type: "tool",
        params: "",
        result: msg.content as string,
        loading: false,
      } as ChatToolCallingMessage);
    }
  }

  abortController.stop();
}

type AbortControllerInterface = {
  init: () => void;
  stop: () => void;
  end: () => boolean;
};

export function createAbortController() {
  let c: AbortController | null = null;
  function stop() {
    if (!c) {
      return;
    }
    c.abort();
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
