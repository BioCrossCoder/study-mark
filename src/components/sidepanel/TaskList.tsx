import { statusIcon } from "@/common/enums";
import { Task } from "@/common/types";
import { sortBy } from "@/common/utils";
import { useRemoveTask, useTaskQuery } from "@/services/task";
import { Card } from "primereact/card";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { DataView } from "primereact/dataview";
import { Toast } from "primereact/toast";
import UpdateTaskDialog from "./UpdateTaskDialog";
import { Tag } from "primereact/tag";
import {
  useRelationsOfAllTasks,
  useRemoveRelationsOfTask,
} from "@/services/relation";
import { useTargetNames } from "@/services/target";

export default function TaskList() {
  const { data } = useTaskQuery();
  const list = useMemo(
    () => (data ? Object.values(data).toSorted(sortBy("lastVisit")) : []),
    [data],
  );
  return <DataView value={list} itemTemplate={DataItem} rows={list.length} />;
}

function DataItem(data: Task) {
  const { id, name, status, position, source } = data;
  const { url } = position;

  const toast = useRef<Toast>(null);
  async function handleCopy() {
    await navigator.clipboard.writeText(name);
    toast.current?.show({
      severity: "info",
      summary: "Task name copied",
    });
  }

  const [visible, setVisible] = useState(false);

  const relations = useRelationsOfAllTasks();
  const targetNames = useTargetNames();

  const removeTask = useRemoveTask();
  const removeRelations = useRemoveRelationsOfTask();
  function handleRemove(event: React.MouseEvent<HTMLElement>) {
    confirmPopup({
      target: event.currentTarget,
      message: "Remove this Task?",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await removeTask(id);
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
            <p
              className="text-lg hover:cursor-copy hover:text-(--primary-color)"
              onClick={handleCopy}
            >
              {name}
            </p>
            <Toast ref={toast} position="top-center" />
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
              <UpdateTaskDialog close={() => setVisible(false)} id={id} />
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
          {(relations[id] ?? []).map((targetId) => (
            <Tag value={targetNames[targetId]} />
          ))}
        </div>
      }
      footer={
        <div className="flex justify-between">
          <div
            className="flex items-center hover:cursor-pointer hover:text-(--primary-color)"
            onClick={() => browser.tabs.create({ url })}
          >
            <i className="pi pi-bookmark-fill" />
            <p className="p-2">Position</p>
          </div>
          <div
            className="flex items-center hover:cursor-pointer hover:text-(--primary-color)"
            onClick={() => browser.tabs.create({ url: source })}
          >
            <i className="pi pi-link" />
            <p className="p-2">Source</p>
          </div>
        </div>
      }
    />
  );
}
