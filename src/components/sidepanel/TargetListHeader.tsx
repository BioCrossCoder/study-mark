import { DialogType } from "@/common/enums";
import CreateTargetDialog from "./CreateTargetDialog";
import { useDialogVisible } from "@/services/uiState";
import { closeDialog, openDialog } from "@/services/storage/uiState";
import { SaveTargetForm } from "@/common/types";

export default function TargetListHeader() {
  const visible = useDialogVisible(DialogType.CreateTarget);
  function handleOpen() {
    const form: SaveTargetForm = {
      name: "",
      description: "",
      tasks: [],
    };
    openDialog(DialogType.CreateTarget, "", form);
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <p>Targets</p>
        <i
          className="pi pi-plus hover:text-(--primary-color)!"
          onClick={handleOpen}
        />
      </div>
      {visible && <CreateTargetDialog close={closeDialog} />}
    </div>
  );
}
