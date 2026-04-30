import { useToast } from "primevue";

export function useNotice() {
  const toast = useToast();
  function showError(summary: string, error: Error) {
    toast.add({
      severity: "error",
      summary,
      detail: error.message,
    });
  }
  return { ...toast, showError };
}
