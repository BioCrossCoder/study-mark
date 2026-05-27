import { taskData } from "@/stores/task";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useTaskQuery() {
  return useQuery({
    queryKey: [],
    queryFn: taskData.getValue,
  });
}

export function useTaskMutation() {
  const { refetch } = useTaskQuery();
  return useMutation({
    mutationFn: taskData.setValue,
    onSuccess() {
      refetch();
    },
  });
}
