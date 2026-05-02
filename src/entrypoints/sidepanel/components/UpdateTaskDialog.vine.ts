import { useTasksMutation } from "@/stores/tasks";
import { taskSchema } from "@/common/types";
import { useTaskQuery } from "../stores/task";
import { ExecStatus, statusIcon } from "@/common/enums";
import { useNotice } from "@/composables/useNotice";
import {
  Button,
  Dialog,
  InputText,
  MultiSelect,
  RadioButton,
  Textarea,
} from "primevue";
import { useTargetOptionsQuery } from "../stores/target";
import { useRelatedItemsQuery } from "../stores/relatedItems";
import { useRelationsMutation } from "@/stores/relations";

export default function UpdateTaskDialog() {
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

  const { data } = useTaskQuery(target);
  const title = ref("");
  const state = ref(ExecStatus.Todo);
  const description = ref("");
  const position = ref("");
  watch(data, (value) => {
    title.value = value?.title ?? "";
    state.value = value?.state ?? ExecStatus.Todo;
    description.value = value?.description ?? "";
    position.value = (value?.position ?? "").trim();
  });

  const targets = ref(new Array<string>());
  const { data: optionsData } = useTargetOptionsQuery();
  const options = computed(() => optionsData.value ?? []);
  const { data: relationData } = useRelatedItemsQuery(target);
  watch(relationData, (value) => {
    targets.value = (value ?? []).map((item) => item.id);
  });

  async function handleSetPosition() {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    position.value = tab.url ?? position.value;
  }

  const { save } = useTasksMutation();
  const { add, remove } = useRelationsMutation();
  const { showError } = useNotice();
  async function handleSubmit() {
    const form = {
      ...data.value,
      title: title.value,
      state: state.value,
      description: description.value,
      position: position.value,
    };
    const { success, data: newData, error } = taskSchema.safeParse(form);
    if (!success) {
      showError("Update Task Failed", error);
      return;
    }
    const result = await save(newData);
    if (result.isErr()) {
      showError("Update Task Failed", result.error);
      return;
    }
    await remove(
      (relationData.value ?? []).map((item) => [target.value, item.id]),
    );
    await add(targets.value.map((targetId) => [target.value, targetId]));
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
        <label class="text-lg">State</label>
        <div class="flex items-center gap-4">
          <div v-for="item in Object.keys(statusIcon)">
            <div class="flex items-center gap-1">
              <RadioButton v-model="state" :value="Number(item)"/>
              <label class="flex items-center">
                <p class="px-1">{{ExecStatus[Number(item)]}}</p>
                <i :class="statusIcon[Number(item) as ExecStatus]"/>
              </label>
            </div>
          </div>
        </div>
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
        <label for="source" class="text-lg">Source</label>
        <InputText
          id="source"
          :model-value="data?.source"
          autocomplete="off"
          class="flex-auto h-10 text-base!"
          disabled
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="position" class="text-lg flex items-center">
          <p>Position</p>
          <i
            class="pi pi-bookmark hover:cursor-pointer hover:text-primary-300 mx-2"
            @click="handleSetPosition"
          />
        </label>
        <InputText
          id="position"
          v-model="position"
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
