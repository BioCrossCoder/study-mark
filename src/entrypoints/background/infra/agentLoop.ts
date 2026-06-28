import {
  ChatAIReasoningMessage,
  ChatAIMessageItem,
  ChatAITextMessage,
  ChatToolCallingOutputMessage,
  ChatToolCallingInputMessage,
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
  abortController: { end: () => boolean },
  send: (message: ChatAIMessageItem) => Promise<void>,
) {
  const stream = await agent.stream({ messages }, { streamMode: "messages" });
  for await (const [chunk] of stream) {
    if (abortController.end()) {
      await stream.cancel();
      return;
    }

    if (AIMessageChunk.isInstance(chunk)) {
      const msg = chunk as AIMessageChunk;
      if (msg.additional_kwargs.reasoning_content) {
        const msgToSend: ChatAIReasoningMessage = {
          type: "think",
          content: msg.additional_kwargs.reasoning_content as string,
          loading: true,
        };
        await send(msgToSend);
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
        const msgToSend: ChatToolCallingInputMessage = {
          type: "tool",
          name:
            msg.tool_calls?.at(0)?.name ??
            msg.tool_call_chunks?.at(0)?.name ??
            msg.invalid_tool_calls?.at(0)?.name ??
            "",
          params: toolCallArgs ?? msg.tool_call_chunks?.at(0)?.args ?? "",
          loading: true,
        };
        await send(msgToSend);
      } else if (msg.content.length > 0) {
        const msgToSend: ChatAITextMessage = {
          type: "text",
          content: msg.content as string,
        };
        await send(msgToSend);
      }
    } else if (ToolMessageChunk.isInstance(chunk)) {
      const msg = chunk as ToolMessageChunk;
      const output = msg.contentBlocks.at(0)?.output;
      const result =
        output && Object.keys(output).length > 0 ? JSON.stringify(output) : "";
      const msgToSend: ChatToolCallingOutputMessage = {
        type: "tool",
        result,
        full: false,
        loading: true,
      };
      await send(msgToSend);
    } else if (ToolMessage.isInstance(chunk)) {
      const msgToSend: ChatToolCallingOutputMessage = {
        type: "tool",
        result: chunk.content as string,
        full: true,
        loading: false,
      };
      await send(msgToSend);
    }
  }
}
