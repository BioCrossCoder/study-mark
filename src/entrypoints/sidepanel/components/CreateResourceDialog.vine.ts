import { useTasksMutation } from "@/stores/tasks";
import { useNotice } from "@/composables/useNotice";
import { ObjectType } from "@/common/enums";
import { Resource, resourceSchema } from "@/common/types";
import { Button, Dialog, InputText, Textarea } from "primevue";
import { useLoadTabInfo } from "@/composables/useLoadTabInfo";

export default function CreateResourceDialog() {
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
  const { loading, run: handleSetSource } = useLoadTabInfo(
    source,
    title,
    description,
  );

  const { newId, save } = useTasksMutation();
  const { showError } = useNotice();
  async function handleSubmit() {
    // [GenerateUniqueID]
    const id = await newId();
    if (id.isErr()) {
      showError("Generate Resource ID Failed", id.error);
      return;
    } // [/]
    const form: Resource = {
      id: id.value,
      type: ObjectType.Resource,
      title: title.value,
      description: description.value,
      source: source.value,
      createAt: Date.now(),
    };
    // [ParseDataFormat]
    const { success, data, error } = resourceSchema.safeParse(form);
    if (!success) {
      showError("Create Resource Failed", error);
      return;
    } // [/]
    // [PersistDataChange]
    const result = await save(data);
    if (result.isErr()) {
      showError("Create Resource Failed", result.error);
      return;
    } // [/]
    close();
  }

  return vine`
    <Dialog
      v-model:visible="show"
      modal
      header="Create Resource"
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
          :disabled="loading"
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
