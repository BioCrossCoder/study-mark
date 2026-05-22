import { ModelProviderProtocol } from "@/common/enums";
import { ModelConfig } from "@/common/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

const key = "sync:modelConfig";
export const modelConfig = storage.defineItem<ModelConfig>(key, {
  fallback: {
    protocol: ModelProviderProtocol.OpenAI,
    baseURL: "",
    apiKey: "",
    model: "",
    tavilyApiKey: "",
  },
});

export function useModelConfigQuery() {
  return useQuery({
    queryKey: [key],
    queryFn: modelConfig.getValue,
  });
}

export function useModelConfigMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: modelConfig.setValue,
    async onSuccess() {
      await client.invalidateQueries({ queryKey: [key] });
    },
  });
}
