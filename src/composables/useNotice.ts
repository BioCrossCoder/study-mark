import { useToast } from "primevue";

export function useNotice() {
  const toast = useToast();
  function showError(summary: string, error: { message: string }) {
    toast.add({
      severity: "error",
      summary,
      detail: error.message,
    });
  }
  return { ...toast, showError };
}
