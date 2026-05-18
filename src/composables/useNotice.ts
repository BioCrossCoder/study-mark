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
  function showSuccess(summary: string) {
    toast.removeAllGroups();
    toast.add({
      severity: "success",
      summary,
    });
  }
  function showInfo(summary: string) {
    toast.removeAllGroups();
    toast.add({
      severity: "info",
      summary,
    });
  }
  return { ...toast, showError, showSuccess, showInfo };
}
