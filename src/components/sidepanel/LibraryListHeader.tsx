import { DialogType } from "@/common/enums";
import CreateLibraryDialog from "./CreateLibraryDialog";
import { useDialogVisible } from "@/hooks/useDialogVisible";

export default function LibraryListHeader() {
  const [visible, setVisible] = useDialogVisible(DialogType.CreateLibrary);
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <p>Libraries</p>
        <i
          className="pi pi-plus hover:text-(--primary-color)!"
          onClick={() => setVisible(true)}
        />
      </div>
      {visible && <CreateLibraryDialog close={() => setVisible(false)} />}
    </div>
  );
}
