import { ModelProviderProtocol } from "@/common/enums";
import { ModelConfig } from "@/common/types";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogle } from "@langchain/google";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";

export function createGeneralAgent(config: ModelConfig) {
  const model = createModelAdapter(config);
  return createAgent({
    model,
  });
}

function createModelAdapter(config: ModelConfig) {
  const { model, baseURL, apiKey } = config;
  switch (config.protocol) {
    case ModelProviderProtocol.OpenAI:
      return new ChatOpenAI({
        model,
        configuration: {
          baseURL,
          apiKey,
        },
      });
    case ModelProviderProtocol.Anthropic:
      return new ChatAnthropic({
        model,
        apiKey,
        anthropicApiUrl: baseURL,
      });
    case ModelProviderProtocol.Google:
      return new ChatGoogle(model, {
        apiKey,
      });
  }
}
