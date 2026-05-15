import { ExecStatus, ObjectType } from "@/common/enums";
import { Target, targetSchema } from "@/common/types";
import { useTasksMutation } from "@/stores/tasks";

export function useCreateTarget() {
  const { newId, save } = useTasksMutation();
  const { showError } = useNotice();
  return async (params: { title: string; description: string }) => {
    // [GenerateUniqueID]
    const id = await newId();
    if (id.isErr()) {
      showError("Generate Target ID Failed", id.error);
      return;
    } // [/]
    const form: Target = {
      id: id.value,
      type: ObjectType.Target,
      state: ExecStatus.Todo,
      createAt: Date.now(),
      ...params,
    };
    // [ParseDataFormat]
    const { success, data, error } = targetSchema.safeParse(form);
    if (!success) {
      showError("Create Target Failed", error);
      return;
    } // [/]
    // [PersistDataChange]
    const result = await save(data);
    if (result.isErr()) {
      showError("Create Target Failed", result.error);
      return;
    } // [/]
    return id.value;
  };
}
