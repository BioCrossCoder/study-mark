import { relationData } from "@/stores/relation";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useRelationQuery() {
  return useQuery({
    queryKey: [],
    queryFn: relationData.getValue,
  });
}

export function useRelationMutation() {
  const { refetch } = useRelationQuery();
  return useMutation({
    mutationFn: relationData.setValue,
    onSuccess() {
      refetch();
    },
  });
}
