import { DialogType } from "@/common/enums";
import CreateTaskDialog from "./CreateTaskDialog";
import { CreateTaskForm } from "@/common/types";
import { useDialogVisible } from "@/services/uiState";
import { closeDialog, openDialog } from "@/services/storage/uiState";

export default function TaskListHeader() {
  const visible = useDialogVisible(DialogType.CreateTask);
  function handleOpen() {
    const form: CreateTaskForm = {
      name: "",
      description: "",
      source: "",
      targets: [],
    };
    openDialog(DialogType.CreateTask, "", form);
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <p>Tasks</p>
        <i
          className="pi pi-plus hover:text-(--primary-color)!"
          onClick={handleOpen}
        />
      </div>
      {visible && <CreateTaskDialog close={closeDialog} />}
    </div>
  );
}
