import { useTasksMutation } from "@/stores/tasks";
import { ExecStatus, PlanType } from "@/common/enums";
import { Button, Dialog, InputText, Textarea } from "primevue";
import { Target, targetSchema } from "@/common/types";
import { useNotice } from "@/composables/useNotice";

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
    if (success) {
      save(data);
    } else {
      showError("Create Target Failed", error);
    }
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
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="close"/>
        <Button label="Save" @click="handleSubmit"/>
      </div>
    </Dialog>
  `;
}
