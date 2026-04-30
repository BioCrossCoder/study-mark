import { useTasksMutation } from "@/stores/tasks";
import { ExecStatus } from "@/common/enums";
import { Button, Dialog, InputText } from "primevue";

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

  const { newId, save } = useTasksMutation();
  async function handleSubmit() {
    const id = await newId();
    if (id.isErr()) {
      // TODO
      return;
    }
    save({
      id: id.value,
      title: title.value,
      state: ExecStatus.Todo,
      description: description.value,
    });
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
        <InputText
          id="description"
          v-model="description"
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
