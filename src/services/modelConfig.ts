import { StoreKey } from "@/common/enums";
import { useMutation, useQuery } from "@tanstack/react-query";
import { modelConfigData } from "./storage/modelConfig";

export function useModelConfigQuery() {
  return useQuery({
    queryKey: [StoreKey.ModelConfig],
    queryFn: modelConfigData.getValue,
  });
}

export function useModelConfigMutation() {
  const { refetch } = useModelConfigQuery();
  return useMutation({
    mutationFn: modelConfigData.setValue,
    onSuccess() {
      refetch();
    },
  });
}
