import { ToastContext } from "@/contexts/ToastContext";

export function useToast() {
  return useContext(ToastContext);
}
