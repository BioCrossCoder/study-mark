import { AgentMode } from "@/common/enums";
import { planSchema } from "@/common/schemas";
import { ChatAIMessage, ChatToolCallingMessage, Plan } from "@/common/types";
import FormDialog from "../common/FormDialog";
import { Toast } from "primereact/toast";
import { CodeHighlighter } from "@ant-design/x";
import { useCreateTarget } from "@/services/target";
import { useCreateTask } from "@/services/task";
import { useCreateRelations } from "@/services/relation";
import { RefObject } from "react";

export default function CreatePlanDialog(props: {
  close: () => void;
  message: ChatAIMessage;
  toast: RefObject<Toast | null>;
}) {
  const outline = props.message.content.findLast((item) => {
    if (props.message.mode !== AgentMode.Plan || item.type !== "tool") {
      return false;
    }
    try {
      const { success } = planSchema.safeParse(JSON.parse(item.result));
      return success;
    } catch {
      return false;
    }
  });
  const plan = outline
    ? (JSON.parse((outline as ChatToolCallingMessage).result) as Plan)
    : undefined;
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
  return (
    <FormDialog
      header="Create Plan"
      onHide={props.close}
      fields={[
        {
          name: "",
          item: (
            <CodeHighlighter
              lang="json"
              header={false}
              classNames={{
                code: "rounded-xl!",
              }}
            >
              {plan ? JSON.stringify(plan, null, 2) : ""}
            </CodeHighlighter>
          ),
        },
      ]}
      onSubmit={handleSubmit}
      disabled={plan === undefined}
    />
  );
}
