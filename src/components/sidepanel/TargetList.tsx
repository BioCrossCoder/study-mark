import { statusIcon } from "@/common/enums";
import { Target } from "@/common/types";
import { sortBy } from "@/common/utils";
import { useRelationsOfAllTargets } from "@/services/relation";
import { useTargetData, useUpdateTargetStatus } from "@/services/target";
import { useTaskNames } from "@/services/task";
import { Card } from "primereact/card";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { DataView } from "primereact/dataview";
import UpdateTargetDialog from "./UpdateTargetDialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { removeRelationsOfTarget } from "@/services/storage/relation";
import { removeTarget } from "@/services/storage/target";

export default function TargetList() {
  const data = useTargetData();
  const list = useMemo(
    () => (data ? Object.values(data).toSorted(sortBy("createdAt")) : []),
    [data],
  );
  return <DataView value={list} itemTemplate={DataItem} rows={list.length} />;
}

function DataItem(data: Target) {
  const { id, name, status, description } = data;
  const [visible, setVisible] = useState(false);

  const relations = useRelationsOfAllTargets();
  const taskNames = useTaskNames();

  function handleRemove(event: React.MouseEvent<HTMLElement>) {
    confirmPopup({
      target: event.currentTarget,
      message: "Remove this Target?",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await removeTarget(id);
        await removeRelationsOfTarget(id);
      },
    });
  }

  const options = Object.keys(statusIcon);
  const [option, setOption] = useState(status);
  const toast = useRef<Toast>(null);
  const updateTargetStatus = useUpdateTargetStatus(toast);
  async function handleChangeStatus(event: DropdownChangeEvent) {
    await updateTargetStatus(id, event.value);
    setOption(event.value);
  }

  return (
    <Card
      className="bg-(--highlight-bg)! mb-3"
      title={
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center">
            <p className="text-lg">{name}</p>
            <i
              className={statusIcon[status] + " mx-2 text-(--primary-color)"}
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <i
              className="pi pi-pen-to-square hover:cursor-pointer hover:text-(--primary-color)"
              onClick={() => setVisible(true)}
            />
            {visible && (
              <UpdateTargetDialog
                close={() => setVisible(false)}
                data={data}
                relatedItemIds={relations[id]}
              />
            )}
            <i
              className="pi pi-trash hover:cursor-pointer hover:text-red-400"
              onClick={handleRemove}
            />
            <ConfirmPopup />
          </div>
        </div>
      }
      subTitle={
        <div className="grid grid-cols-3 gap-4">
          {(relations[id] ?? []).map((taskId) => (
            <Tag value={taskNames[taskId]} />
          ))}
        </div>
      }
      footer={
        <div className="flex justify-center">
          <Dropdown
            value={option}
            onChange={handleChangeStatus}
            options={options}
            className="w-30 text-xs"
          />
          <Toast ref={toast} position="top-center" />
        </div>
      }
    >
      <p className="text-xs">{description}</p>
    </Card>
  );
}
