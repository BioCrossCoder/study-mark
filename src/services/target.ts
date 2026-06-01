import { StoreKey } from "@/common/enums";
import { targetData } from "@/services/storage/target";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useTargetQuery() {
  return useQuery({
    queryKey: [StoreKey.Target],
    queryFn: targetData.getValue,
  });
}

export function useTargetMutation() {
  const { refetch } = useTargetQuery();
  return useMutation({
    mutationFn: targetData.setValue,
    onSuccess() {
      refetch();
    },
  });
}
