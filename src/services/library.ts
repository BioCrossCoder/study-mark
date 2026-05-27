import { libraryData } from "@/stores/library";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useLibraryQuery() {
  return useQuery({
    queryKey: [],
    queryFn: libraryData.getValue,
  });
}

export function useLibraryMutation() {
  const { refetch } = useLibraryQuery();
  return useMutation({
    mutationFn: libraryData.setValue,
    onSuccess() {
      refetch();
    },
  });
}
