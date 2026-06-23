import { DialogType } from "@/common/enums";
import CreateLibraryDialog from "./CreateLibraryDialog";
import { useDialogVisible } from "@/services/uiState";
import { closeDialog, openDialog } from "@/services/storage/uiState";
import { SaveLibraryForm } from "@/common/types";

export default function LibraryListHeader() {
  const visible = useDialogVisible(DialogType.CreateLibrary);
  function handleOpen() {
    const form: SaveLibraryForm = {
      name: "",
      description: "",
      source: "",
    };
    openDialog(DialogType.CreateLibrary, "", form);
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <p>Libraries</p>
        <i
          className="pi pi-plus hover:text-(--primary-color)!"
          onClick={handleOpen}
        />
      </div>
      {visible && <CreateLibraryDialog close={closeDialog} />}
    </div>
  );
}
