import { useTasksMutation } from "@/stores/tasks";
import { ExecStatus, PlanType } from "@/common/enums";
import { Button, Dialog, InputText, MultiSelect, Textarea } from "primevue";
import { Target, targetSchema } from "@/common/types";
import { useNotice } from "@/composables/useNotice";
import { useTaskOptionsQuery } from "../stores/task";
import { useRelationsMutation } from "@/stores/relations";

export default function CreateTargetDialog() {
  const show = ref(false);
  function open() {
    show.value = true;
  }
  vineExpose({
    open,
  });
  function close() {
    show.value = false;
    title.value = "";
    description.value = "";
  }

  const title = ref("");
  const description = ref("");

  const tasks = ref(new Array<string>());
  const { data } = useTaskOptionsQuery();
  const options = computed(() => data.value ?? []);

  const { newId, save } = useTasksMutation();
  const { add } = useRelationsMutation();
  const { showError } = useNotice();
  async function handleSubmit() {
    const id = await newId();
    if (id.isErr()) {
      showError("Generate Target ID Failed", id.error);
      return;
    }
    const form: Target = {
      id: id.value,
      type: PlanType.Target,
      title: title.value,
      state: ExecStatus.Todo,
      description: description.value,
      createAt: Date.now(),
    };
    const { success, data, error } = targetSchema.safeParse(form);
    if (!success) {
      showError("Create Target Failed", error);
      return;
    }
    const result = await save(data);
    if (result.isErr()) {
      showError("Create Target Failed", result.error);
      return;
    }
    add(tasks.value.map((taskId) => [id.value, taskId]));
    close();
  }

  return vine`
    <Dialog
      v-model:visible="show"
      modal
      header="Create Target"
      class="w-6/7"
      append-to="self"
      :draggable="false"
    >
      <div class="flex flex-col mb-4">
        <label for="title" class="text-lg">Title</label>
        <InputText
          id="title"
          v-model="title"
          autocomplete="off"
          class="flex-auto h-10 text-base!"
          autofocus
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="description" class="text-lg">Description</label>
        <Textarea
          id="description"
          v-model="description"
          autocomplete="off"
          rows="3"
          class="flex-auto text-base!"
        />
      </div>
      <div class="flex flex-col mb-8">
        <label for="tasks" class="text-lg flex items-center">Tasks</label>
        <MultiSelect
          input-id="tasks"
          v-model="tasks"
          :options="options"
          option-label="name"
          option-value="code"
          display="chip"
          filter
          placeholder="Select Tasks"
          :max-selected-labels="3"
          class="flex-auto h-10 text-base!"
        />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="close"/>
        <Button label="Save" @click="handleSubmit"/>
      </div>
    </Dialog>
  `;
}
