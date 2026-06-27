import { DialogType } from "@/common/enums";
import { DialogForm } from "@/common/types";
import { updateDialogForm } from "@/services/storage/uiState";
import { useDialogForm } from "@/services/uiState";

export function useDialogFormField<
  T extends DialogType,
  K extends keyof DialogForm[T],
>(_type: T, field: K) {
  const form = useDialogForm<T>();
  const [value, setValue] = useState(form[field] as DialogForm[T][K]);
  useEffect(() => {
    updateDialogForm({ ...form, [field]: value });
  }, [value]);
  return [value, setValue] as const;
}
