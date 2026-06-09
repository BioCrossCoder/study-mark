import { Plan } from "@/common/types";
import { createRelations } from "@/services/storage/relation";
import { useCreateTarget } from "@/services/target";
import { useCreateTask } from "@/services/task";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export function useCreatePlan(toast: RefObject<Toast | null>) {
  const createTarget = useCreateTarget(toast);
  const createTask = useCreateTask(toast);
  return async (plan: Plan) => {
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
    toast.current?.show({
      severity: "success",
      summary: "Create Plan Succeeded",
    });
    return {
      targetId,
      taskIds,
    };
  };
}
