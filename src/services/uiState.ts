import { useWxtStore } from "@/hooks/common/useWxtStore";
import { uiStateData } from "./storage/uiState";
import { DialogType } from "@/common/enums";
import { DialogForm } from "@/common/types";

export function useUiStateData() {
  return useWxtStore(uiStateData);
}

export function useDialogForm<T extends DialogType>() {
  const { activeDialog } = useUiStateData();
  const { form } = activeDialog;
  return form as DialogForm[T];
}

export function useDialogVisible(type: DialogType, id = "") {
  const { activeDialog } = useUiStateData();
  return activeDialog.type === type && activeDialog.id === id;
}
