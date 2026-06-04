import {
  AIMessage,
  AIMessageChunk,
  createAgent,
  HumanMessage,
} from "langchain";

export async function execAgentLoop(
  agent: ReturnType<typeof createAgent>,
  messages: (HumanMessage | AIMessage)[],
  abortController: AbortControllerInterface,
  send: (message: AIMessageChunk) => void,
) {
  const stream = await agent.stream({ messages }, { streamMode: "messages" });
  abortController.init();
  for await (const [chunk] of stream) {
    if (abortController.end()) {
      await stream.cancel();
      return;
    }
    send(chunk as AIMessageChunk);
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
