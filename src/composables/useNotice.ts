import { useToast } from "primevue";

export function useNotice() {
  const toast = useToast();
  function showError(summary: string, error: { message: string }) {
    toast.removeAllGroups();
    toast.add({
      severity: "error",
      summary,
      detail: error.message,
    });
  }
  return { ...toast, showError };
}
