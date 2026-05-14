import { useTasksMutation } from "@/stores/tasks";
import { useNotice } from "@/composables/useNotice";
import { PlanType } from "@/common/enums";
import { MicroLinkApiResp, Resource, resourceSchema } from "@/common/types";
import { Button, Dialog, InputText, Textarea } from "primevue";

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
  async function handleSetSource() {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    source.value = tab.url ?? source.value;
    title.value = tab.title ?? title.value;
    if (!source.value) {
      return;
    }
    const resp = await fetch(`https://api.microlink.io?url=${source.value}`);
    if (!resp.ok) {
      return;
    }
    const result = (await resp.json()) as MicroLinkApiResp;
    if (result.status !== "success") {
      return;
    }
    description.value = result.data.description ?? description.value;
  }

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
      type: PlanType.Resource,
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
