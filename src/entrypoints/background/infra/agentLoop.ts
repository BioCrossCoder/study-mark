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
        await send({
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
        await send({
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
        await send({
          type: "text",
          content: msg.content,
        } as ChatAITextMessage);
      }
    } else if (ToolMessageChunk.isInstance(chunk)) {
      const msg = chunk as ToolMessageChunk;
      const output = msg.contentBlocks.at(0)?.output;
      const result =
        output && Object.keys(output).length > 0 ? JSON.stringify(output) : "";
      await send({
        type: "tool",
        params: "",
        result,
        loading: true,
        fullResult: false,
      } as ChatToolCallingMessage);
    } else if (ToolMessage.isInstance(chunk)) {
      const msg = chunk as ToolMessage;
      await send({
        type: "tool",
        params: "",
        result: msg.content as string,
        loading: false,
        fullResult: true,
      } as ChatToolCallingMessage);
    }
  }
}
