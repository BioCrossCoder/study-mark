import { ExecStatus, ObjectType } from "@/common/enums";
import { Task, taskSchema } from "@/common/types";
import { useTasksMutation } from "@/stores/tasks";

export function useCreateTask() {
  const { newId, save } = useTasksMutation();
  const { showError } = useNotice();
  return async (params: {
    title: string;
    description: string;
    source: string;
  }) => {
    // [GenerateUniqueID]
    const id = await newId();
    if (id.isErr()) {
      showError("Generate Task ID Failed", id.error);
      return;
    } // [/]
    const form: Task = {
      id: id.value,
      type: ObjectType.Task,
      state: ExecStatus.Todo,
      ...params,
      position: params.source,
      createAt: Date.now(),
    };
    // [ParseDataFormat]
    const { success, data, error } = taskSchema.safeParse(form);
    if (!success) {
      showError("Create Task Failed", error);
      return;
    } // [/]
    // [PersistDataChange]
    const result = await save(data);
    if (result.isErr()) {
      showError("Create Task Failed", result.error);
      return;
    } // [/]
    return id.value;
  };
}
