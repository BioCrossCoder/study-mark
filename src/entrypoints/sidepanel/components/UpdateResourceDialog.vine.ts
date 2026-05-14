import { useResourceQuery } from "../stores/resource";
import { useTasksMutation } from "@/stores/tasks";
import { useNotice } from "@/composables/useNotice";
import { resourceSchema } from "@/common/types";
import { Button, Dialog, InputText, Textarea } from "primevue";

export default function UpdateResourceDialog() {
  const show = ref(false);
  const target = ref("");
  function open(id: string) {
    show.value = true;
    target.value = id;
  }
  vineExpose({
    open,
  });
  function close() {
    show.value = false;
    target.value = "";
  }

  const { data } = useResourceQuery(target);
  const title = ref("");
  const description = ref("");
  const source = ref("");
  watch(data, (value) => {
    title.value = value?.title ?? "";
    description.value = value?.description ?? "";
    source.value = value?.source ?? "";
  });

  async function handleSetSource() {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    source.value = tab.url ?? source.value;
  }

  const { save } = useTasksMutation();
  const { showError } = useNotice();
  async function handleSubmit() {
    const form = {
      ...data.value,
      title: title.value,
      description: description.value,
      source: source.value,
    };
    // [ParseDataFormat]
    const { success, data: newData, error } = resourceSchema.safeParse(form);
    if (!success) {
      showError("Update Resource Failed", error);
      return;
    } // [/]
    // [PersistDataChange]
    const result = await save(newData);
    if (result.isErr()) {
      showError("Update Resource Failed", result.error);
      return;
    } // [/]
    close();
  }

  return vine`
    <Dialog
      v-model:visible="show"
      modal
      header="Update Task"
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
            @click="handleSetSource"
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
