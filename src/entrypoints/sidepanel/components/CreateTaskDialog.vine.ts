import { useTasksMutation } from "@/stores/tasks";
import { ExecStatus, PlanType } from "@/common/enums";
import { Button, Dialog, InputText, Textarea } from "primevue";
import { Task, taskSchema } from "@/common/types";
import { useNotice } from "@/composables/useNotice";

export default function CreateTaskDialog() {
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
    source.value = "";
  }

  const title = ref("");
  const description = ref("");
  const source = ref("");

  async function handleSetPosition() {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    source.value = tab.url ?? source.value;
  }

  const { newId, save } = useTasksMutation();
  const { showError } = useNotice();
  async function handleSubmit() {
    const id = await newId();
    if (id.isErr()) {
      showError("Generate Target ID Failed", id.error);
      return;
    }
    const form: Task = {
      id: id.value,
      type: PlanType.Task,
      title: title.value,
      state: ExecStatus.Todo,
      description: description.value,
      source: source.value,
      position: source.value,
      createAt: Date.now(),
    };
    const { success, data, error } = taskSchema.safeParse(form);
    if (!success) {
      showError("Create Task Failed", error);
      return;
    }
    const result = await save(data);
    if (result.isErr()) {
      showError("Create Task Failed", result.error);
      return;
    }
    close();
  }

  return vine`
    <Dialog
      v-model:visible="show"
      modal
      header="Create Task"
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
      <div class="flex flex-col mb-4">
        <label for="source" class="text-lg flex items-center">
          <p>Source</p>
          <i
            class="pi pi-bookmark hover:cursor-pointer hover:text-primary-300 mx-2"
            @click="handleSetPosition"
          />
        </label>
        <InputText
          id="source"
          v-model="source"
          autocomplete="off"
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
