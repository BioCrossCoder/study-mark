import { DialogType, ExecStatus, ListStyle, statusIcon } from "@/common/enums";
import { Task } from "@/common/types";
import { sortBy } from "@/common/utils";
import { useTaskData, useUpdateTaskStatus } from "@/services/task";
import { Card } from "primereact/card";
import { confirmPopup } from "primereact/confirmpopup";
import { DataView } from "primereact/dataview";
import UpdateTaskDialog from "./UpdateTaskDialog";
import { Tag } from "primereact/tag";
import { useRelationsOfAllTasks } from "@/services/relation";
import { useTargetNames } from "@/services/target";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { removeRelationsOfTask } from "@/services/storage/relation";
import { removeTask } from "@/services/storage/task";
import { useUiStateData } from "@/services/uiState";
import { Chip } from "primereact/chip";
import React from "react";
import StatusButton from "../common/StatusButton";
import { useToast } from "@/hooks/common/useToast";
import { useDialogVisible } from "@/hooks/useDialogVisible";

export default function TaskList() {
  const data = useTaskData();
  const list = useMemo(
    () => (data ? Object.values(data).toSorted(sortBy("lastVisit", true)) : []),
    [data],
  );
  return <DataView value={list} itemTemplate={DataItem} rows={list.length} />;
}

function DataItem(data: Task) {
  const { listStyle } = useUiStateData();
  const { id, name, status, position, source, description } = data;
  const { url } = position;

  const toast = useToast();
  async function handleCopy() {
    await navigator.clipboard.writeText(name);
    toast.current?.show({
      severity: "info",
      summary: "Task name copied",
    });
  }

  const [visible, setVisible] = useDialogVisible(DialogType.UpdateTask, id);

  const relations = useRelationsOfAllTasks();
  const targetNames = useTargetNames();

  function handleRemove(event: React.MouseEvent<HTMLElement>) {
    confirmPopup({
      target: event.currentTarget,
      message: "Remove this Task?",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: async () => {
        await removeTask(id);
        await removeRelationsOfTask(id);
      },
    });
  }

  const options = Object.keys(statusIcon);
  const [option, setOption] = useState(status);
  const updateTaskStatus = useUpdateTaskStatus(toast);
  async function handleChangeStatus(event: DropdownChangeEvent) {
    await updateTaskStatus(id, event.value);
    setOption(event.value);
  }

  const items = Object.entries(statusIcon).map(([label, icon]) => ({
    icon,
    label,
    command: () => updateTaskStatus(id, label as ExecStatus),
  }));

  switch (listStyle) {
    case ListStyle.Card:
      return (
        <Card
          className="bg-(--highlight-bg)! mb-3"
          title={
            <div className="flex justify-between items-center">
              <div className="flex justify-between items-center">
                <p
                  className="text-lg hover:cursor-copy hover:text-(--primary-color) break-all"
                  onClick={handleCopy}
                >
                  {name}
                </p>
                <i
                  className={
                    statusIcon[status] + " mx-2 text-(--primary-color)"
                  }
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <i
                  className="pi pi-pen-to-square hover:cursor-pointer hover:text-(--primary-color)"
                  onClick={() => setVisible(true)}
                />
                {visible && (
                  <UpdateTaskDialog
                    close={() => setVisible(false)}
                    data={data}
                    relatedItemIds={relations[id] ?? []}
                  />
                )}
                <i
                  className="pi pi-trash hover:cursor-pointer hover:text-red-400"
                  onClick={handleRemove}
                />
              </div>
            </div>
          }
          subTitle={
            <div className="grid grid-cols-3 gap-4">
              {(relations[id] ?? []).map((targetId) => (
                <Tag value={targetNames[targetId]} className="break-all" />
              ))}
            </div>
          }
          footer={
            <div className="flex justify-between">
              <div
                className="flex items-center hover:cursor-pointer hover:text-(--primary-color) gap-1"
                onClick={() => browser.tabs.create({ url })}
              >
                <i className="pi pi-bookmark-fill" />
                <p className="text-xs">Position</p>
              </div>
              <Dropdown
                value={option}
                onChange={handleChangeStatus}
                options={options}
                className="w-30 text-xs"
              />
              <div
                className="flex items-center hover:cursor-pointer hover:text-(--primary-color) gap-1"
                onClick={() => browser.tabs.create({ url: source })}
              >
                <i className="pi pi-link" />
                <p className="text-xs">Source</p>
              </div>
            </div>
          }
        >
          <p className="text-xs">{description}</p>
        </Card>
      );
    case ListStyle.Line:
      return (
        <div className="flex justify-between items-center gap-2">
          <Chip
            label={name}
            className="break-all hover:cursor-pointer hover:text-(--primary-color)!"
            onClick={() => browser.tabs.create({ url })}
          />
          <StatusButton
            status={status}
            callback={(value) => updateTaskStatus(id, value)}
          />
        </div>
      );
    default:
      return <></>;
  }
}
