import { ModelConfig } from "@/common/types";
import { useMutation, useQuery } from "@tanstack/vue-query";

const key = "sync:modelConfig";
export const modelConfig = storage.defineItem<ModelConfig>(key, {
  fallback: {
    baseURL: "",
    apiKey: "",
    model: "",
  },
});

export function useModelConfigQuery() {
  return useQuery({
    queryKey: [key],
    queryFn: modelConfig.getValue,
  });
}

export function useModelConfigMutation() {
  const { refetch } = useModelConfigQuery();
  return useMutation({
    mutationFn: modelConfig.setValue,
    onSuccess() {
      refetch;
    },
  });
}
