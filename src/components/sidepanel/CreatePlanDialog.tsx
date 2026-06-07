import { ChatAIMessage, ChatMessage } from "@/common/types";
import FormDialog from "../common/FormDialog";
import { Toast } from "primereact/toast";
import { CodeHighlighter } from "@ant-design/x";
import { useCreateTarget } from "@/services/target";
import { useCreateTask } from "@/services/task";
import { useCreateRelations } from "@/services/relation";
import { RefObject } from "react";
import { Tag } from "primereact/tag";
import { extractPlanOutline } from "@/common/logics";
import { Button } from "primereact/button";
import { getLastHumanMessageInHistory } from "@/services/storage/chatHistory";
import { AgentMode } from "@/common/enums";

export default function CreatePlanDialog(props: {
  close: () => void;
  message: ChatAIMessage;
  toast: RefObject<Toast | null>;
}) {
  const plan = extractPlanOutline(props.message);
  const createTarget = useCreateTarget(props.toast);
  const createTask = useCreateTask(props.toast);
  const createRelations = useCreateRelations();
  async function handleSubmit() {
    if (!plan) {
      return new Error("Empty Plan");
    }
    const targetId = await createTarget(plan.target);
    if (Error.isError(targetId)) {
      return targetId;
    }
    const taskIds = new Array<string>();
    for (const task of plan.tasks) {
      const result = await createTask(task);
      if (Error.isError(result)) {
        return result;
      }
      taskIds.push(result);
    }
    await createRelations(
      taskIds.map((taskId) => ({
        targetId,
        taskId,
      })),
    );
    props.toast.current?.show({
      severity: "success",
      summary: "Create Plan Succeeded",
    });
    return {
      targetId,
      taskIds,
    };
  }

  async function handleRetry() {
    const content = await getLastHumanMessageInHistory();
    if (content) {
      const message: ChatMessage = {
        mode: AgentMode.Plan,
        message: content.content,
      };
      browser.runtime.sendMessage(message);
      props.close();
    }
  }
  return (
    <FormDialog
      header="Create Plan"
      onHide={props.close}
      fields={[
        {
          name: "",
          item: plan ? (
            <CodeHighlighter
              lang="json"
              header={false}
              classNames={{
                code: "rounded-xl!",
              }}
            >
              {JSON.stringify(plan, null, 2)}
            </CodeHighlighter>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <Tag
                severity="danger"
                value="No Plan available"
                className="text-xl! w-full"
              />
              <Button label="Retry" size="small" onClick={handleRetry} />
            </div>
          ),
        },
      ]}
      onSubmit={handleSubmit}
      disabled={plan === null}
    />
  );
}
