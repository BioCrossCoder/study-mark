import { Button, InputText, MultiSelect, Panel, Textarea } from "primevue";
import { useRelationsMutation } from "@/stores/relations";
import { SignalMessage, taskSchema } from "@/common/types";
import { ExecStatus, MessageType, ObjectType, Signal } from "@/common/enums";
import { useTargetOptionsQuery } from "@/stores/target";
import { sidePanelPath } from "@/stores/sidePanel";
import { useCreateTask } from "@/composables/useCreateTask";

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
    await add(targets.value.map((targetId) => [id, targetId]));
    browser.runtime.sendMessage({
      type: MessageType.Signal,
      content: Signal.UpdateTask,
    } as SignalMessage);
    close();
  }

  async function handleClickMore() {
    await sidePanelPath.setValue("/sidepanel/tasks");
    browser.sidePanel.open({
      windowId: browser.windows.WINDOW_ID_CURRENT,
    });
    browser.runtime.sendMessage({
      type: MessageType.Signal,
      content: Signal.ShowTasks,
    } as SignalMessage);
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
        <div class="flex justify-between">
          <Button label="More" @click="handleClickMore"/>
          <div class="flex justify-between gap-2">
            <Button label="Cancel" severity="secondary" @click="close"/>
            <Button label="Save" @click="handleSubmit"/>
          </div>
        </div>
      </template>
    </Panel>
  `;
}
