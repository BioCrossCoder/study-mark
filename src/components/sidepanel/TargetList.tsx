import { statusIcon } from "@/common/enums";
import { Target } from "@/common/types";
import { sortBy } from "@/common/utils";
import {
  useRelationsOfAllTargets,
  useRemoveRelationsOfTarget,
} from "@/services/relation";
import { useRemoveTarget, useTargetQuery } from "@/services/target";
import { useTaskNames } from "@/services/task";
import { Card } from "primereact/card";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { DataView } from "primereact/dataview";
import UpdateTargetTask from "./UpdateTargetTask";
import { Tag } from "primereact/tag";

export default function TargetList() {
  const { data } = useTargetQuery();
  const list = useMemo(
    () => (data ? Object.values(data).toSorted(sortBy("lastVisit")) : []),
    [data],
  );
  return <DataView value={list} itemTemplate={DataItem} rows={list.length} />;
}

function DataItem(data: Target) {
  const { id, name, status } = data;
  const [visible, setVisible] = useState(false);

  const relations = useRelationsOfAllTargets();
  const taskNames = useTaskNames();

  const removeTarget = useRemoveTarget();
  const removeRelations = useRemoveRelationsOfTarget();
  function handleRemove(event: React.MouseEvent<HTMLElement>) {
    confirmPopup({
      target: event.currentTarget,
      message: "Remove this Target?",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await removeTarget(id);
        await removeRelations(id);
      },
    });
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
              <UpdateTargetTask close={() => setVisible(false)} id={id} />
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
    />
  );
}
