import { Button, InputText, MultiSelect, Panel, Textarea } from "primevue";
import { useTasksMutation } from "@/stores/tasks";
import { useRelationsMutation } from "@/stores/relations";
import { SignalMessage, Task, taskSchema } from "@/common/types";
import { ExecStatus, MessageType, PlanType, Signal } from "@/common/enums";
import { useTargetOptionsQuery } from "@/stores/target";

export default function CreateTaskDialog() {
  function close() {
    window.close();
  }

  const title = ref("");
  const source = ref("");
  onMounted(async () => {
    // [LoadCurrentTab]
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    title.value = tab.title ?? "";
    source.value = tab.url ?? ""; // [/]
  });

  const description = ref("");
  const targets = ref(new Array<string>());
  const { data } = useTargetOptionsQuery();
  const options = computed(() => data.value ?? []);

  const { newId, save } = useTasksMutation();
  const { add } = useRelationsMutation();
  const { showError } = useNotice();
  async function handleSubmit() {
    // [GenerateUniqueID]
    const id = await newId();
    if (id.isErr()) {
      showError("Generate Task ID Failed", id.error);
      return;
    } // [/]
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
    // [ParseDataFormat]
    const { success, data, error } = taskSchema.safeParse(form);
    if (!success) {
      showError("Create Task Failed", error);
      return;
    } // [/]
    // [PersistDataChange]
    const result = await save(data);
    if (result.isErr()) {
      showError("Create Task Failed", result.error);
      return;
    } // [/]
    await add(targets.value.map((targetId) => [id.value, targetId]));
    browser.runtime.sendMessage({
      type: MessageType.Signal,
      content: Signal.UpdateTask,
    } as SignalMessage);
    close();
  }

  return vine`
    <Panel class="w-100">
      <template #header>
        <div class="w-full flex justify-between items-center">
          <p class="font-semibold text-xl">Create Task</p>
          <Button
            icon="pi pi-times"
            severity="secondary"
            variant="text"
            rounded
            @click="close"
          />
        </div>
      </template>
      <template #default>
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
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" @click="close"/>
          <Button label="Save" @click="handleSubmit"/>
        </div>
      </template>
    </Panel>
  `;
}
