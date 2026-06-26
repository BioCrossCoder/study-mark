import { ChatAIMessage, ChatMessage } from "@/common/types";
import { Tag } from "primereact/tag";
import { extractPlanOutline } from "@/common/logics";
import { Button } from "primereact/button";
import { getLastHumanMessageInHistory } from "@/services/storage/chatHistory";
import { AgentCommand, DialogType } from "@/common/enums";
import { Dialog } from "primereact/dialog";
import { useCreatePlan } from "@/hooks/sidepanel/useCreatePlan";
import TargetFormCard from "./TargetFormCard";
import TaskFormCard from "./TaskFormCard";
import { useToast } from "@/hooks/common/useToast";
import { useDialogForm } from "@/services/uiState";
import { updateDialogForm } from "@/services/storage/uiState";

export default function CreatePlanDialog(props: {
  close: () => void;
  message: ChatAIMessage;
}) {
  const plan = extractPlanOutline(props.message);
  const form = useDialogForm<DialogType.CreatePlan>();

  function handleAddItem() {
    form.tasks.push({
      name: "",
      description: "",
      source: "",
    });
    updateDialogForm({ ...form });
  }

  const toast = useToast();
  const createPlan = useCreatePlan(toast);
  async function handleSubmit() {
    if (!form) {
      return new Error("Empty Plan");
    }
    const result = await createPlan(form);
    if (!Error.isError(result)) {
      props.close();
    }
  }

  async function handleRetry() {
    const content = await getLastHumanMessageInHistory();
    if (content) {
      const message: ChatMessage = {
        mode: AgentCommand.Plan,
        message: content.content,
      };
      browser.runtime.sendMessage(message);
      props.close();
    }
  }
  return (
    <Dialog
      visible={true}
      className="w-6/7 max-h-5/8!"
      onHide={props.close}
      draggable={false}
      header="Create Plan"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            label="Cancel"
            size="small"
            severity="secondary"
            onClick={props.close}
          />
          {plan ? (
            <Button label="Submit" size="small" onClick={handleSubmit} />
          ) : (
            <Button label="Retry" size="small" onClick={handleRetry} />
          )}
        </div>
      }
    >
      {plan ? (
        <div className="flex flex-col gap-4">
          <TargetFormCard
            // Avoid the Exception caused by undefined target from async state change
            value={form.target ?? {}}
            onChange={(target) => updateDialogForm({ ...form, target })}
          />
          {/* Avoid the Exception caused by undefined tasks from async state change */}
          {(form.tasks ?? []).map((task, i) => (
            <TaskFormCard
              value={task}
              onChange={(task) => {
                form.tasks[i] = task;
                updateDialogForm({ ...form });
              }}
              order={i + 1}
              onRemove={() => {
                form.tasks.splice(i, 1);
                updateDialogForm({ ...form });
              }}
            />
          ))}
          <Button label="New Task" onClick={handleAddItem} />
        </div>
      ) : (
        <Tag
          severity="danger"
          icon="pi pi-times"
          value="No Plan available"
          className="text-xl! w-full"
        />
      )}
    </Dialog>
  );
}
