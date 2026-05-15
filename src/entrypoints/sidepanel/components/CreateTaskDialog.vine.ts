import { useTasksMutation } from "@/stores/tasks";
import { ExecStatus, ObjectType } from "@/common/enums";
import { Button, Dialog, InputText, MultiSelect, Textarea } from "primevue";
import { taskSchema } from "@/common/types";
import { useNotice } from "@/composables/useNotice";
import { useRelationsMutation } from "@/stores/relations";
import { useTargetOptionsQuery } from "@/stores/target";
import { useCreateTask } from "@/composables/useCreateTask";

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
  async function handleSetSource() {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    source.value = tab.url ?? source.value;
  }

  const targets = ref(new Array<string>());
  const { data } = useTargetOptionsQuery();
  const options = computed(() => data.value ?? []);

  const { add } = useRelationsMutation();
  const createTask = useCreateTask();
  async function handleSubmit() {
    const id = await createTask({
      title: title.value,
      description: description.value,
      source: source.value,
    });
    if (!id) {
      return;
    }
    add(targets.value.map((targetId) => [id, targetId]));
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
      <div class="flex flex-col mb-8">
        <label for="targets" class="text-lg">Targets</label>
        <MultiSelect
          input-id="targets"
          v-model="targets"
          :options="options"
          option-label="name"
          option-value="code"
          display="chip"
          filter
          placeholder="Select Targets"
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
