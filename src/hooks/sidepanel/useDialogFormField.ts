import { DialogType } from "@/common/enums";
import { DialogForm } from "@/common/types";
import { updateDialogForm } from "@/services/storage/uiState";
import { useDialogForm } from "@/services/uiState";

export function useDialogFormField<
  T extends DialogType,
  K extends keyof DialogForm[T],
>(_type: T, field: K) {
  const form = useDialogForm<T>();
  const [value, setValue] = useState(form[field]);
  useEffect(() => {
    setValue(form[field]);
  }, [form]);
  function setValueWithPersist(value: DialogForm[T][K]) {
    setValue(value);
    updateDialogForm({ ...form, [field]: value });
  }
  return [value, setValueWithPersist] as const;
}
