import { targetData } from "@/stores/target";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useTargetQuery() {
  return useQuery({
    queryKey: [],
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
