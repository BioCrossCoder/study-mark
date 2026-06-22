import { DialogType } from "@/common/enums";
import { updateActiveDialog } from "@/services/storage/uiState";
import { useUiStateData } from "@/services/uiState";

export function useDialogVisible(type: DialogType, id = "") {
  const { activeDialog } = useUiStateData();
  const visible = useMemo(
    () => activeDialog.type === type && activeDialog.id === id,
    [activeDialog, type, id],
  );
  const setVisible = useCallback(
    (visible: boolean) => {
      updateActiveDialog(visible ? type : DialogType.None, visible ? id : "");
    },
    [visible, type, id],
  );
  return [visible, setVisible] as const;
}
