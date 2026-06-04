import { ModelProviderProtocol, StoreKey } from "@/common/enums";
import { ModelConfig } from "@/common/types";

export const modelConfigData = storage.defineItem<ModelConfig>(
  StoreKey.ModelConfig,
  {
    fallback: {
      protocol: ModelProviderProtocol.OpenAI,
      baseURL: "",
      apiKey: "",
      model: "",
    },
  },
);
