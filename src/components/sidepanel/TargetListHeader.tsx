import { DialogType } from "@/common/enums";
import CreateTargetDialog from "./CreateTargetDialog";
import { useDialogVisible } from "@/hooks/useDialogVisible";

export default function TargetListHeader() {
  const [visible, setVisible] = useDialogVisible(DialogType.CreateTarget);
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <p>Targets</p>
        <i
          className="pi pi-plus hover:text-(--primary-color)!"
          onClick={() => setVisible(true)}
        />
      </div>
      {visible && <CreateTargetDialog close={() => setVisible(false)} />}
    </div>
  );
}
