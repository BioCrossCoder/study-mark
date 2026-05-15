import { ExecStatus, ObjectType } from "@/common/enums";
import { Button, Dialog, InputText, MultiSelect, Textarea } from "primevue";
import { useTaskOptionsQuery } from "../stores/task";
import { useRelationsMutation } from "@/stores/relations";
import { useCreateTarget } from "@/composables/useCreateTarget";

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

  const { add } = useRelationsMutation();
  const createTarget = useCreateTarget();
  async function handleSubmit() {
    const id = await createTarget({
      title: title.value,
      description: description.value,
    });
    if (!id) {
      return;
    }
    add(tasks.value.map((taskId) => [id, taskId]));
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
        <label for="tasks" class="text-lg">Tasks</label>
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
