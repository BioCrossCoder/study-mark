import { ToastContext } from "@/contexts/content/ToastContext";

export function useToast() {
  return useContext(ToastContext);
}
