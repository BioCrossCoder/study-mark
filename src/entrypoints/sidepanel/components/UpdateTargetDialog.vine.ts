import { useTasksMutation } from "@/stores/tasks";
import { targetSchema, Task } from "@/common/types";
import { useTargetQuery } from "../stores/target";
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
import { useRelationsMutation } from "@/stores/relations";
import { useRelatedItemsQuery } from "../stores/relatedItems";
import { useTaskOptionsQuery } from "../stores/task";

export default function UpdateTargetDialog() {
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

  const { data } = useTargetQuery(target);
  const title = ref("");
  const state = ref(ExecStatus.Todo);
  const description = ref("");
  watch(data, (value) => {
    title.value = value?.title ?? "";
    state.value = value?.state ?? ExecStatus.Todo;
    description.value = value?.description ?? "";
  });

  const tasks = ref(new Array<string>());
  const { data: optionsData } = useTaskOptionsQuery();
  const options = computed(() => optionsData.value ?? []);
  const { data: relationData } = useRelatedItemsQuery(target);
  watch(relationData, (value) => {
    tasks.value = (value ?? []).map((item) => item.id);
  });

  const { save } = useTasksMutation();
  const { add, remove } = useRelationsMutation();
  const { showError } = useNotice();
  async function handleSubmit() {
    const form = {
      ...data.value,
      title: title.value,
      state: state.value,
      description: description.value,
    };
    const { success, data: newData, error } = targetSchema.safeParse(form);
    if (!success) {
      showError("Update Target Failed", error);
      return;
    }
    const result = await save(newData);
    if (result.isErr()) {
      showError("Update Target Failed", result.error);
      return;
    }
    await remove(
      (relationData.value ?? []).map((item) => [target.value, item.id]),
    );
    await add(tasks.value.map((taskId) => [target.value, taskId]));
    close();
  }

  return vine`
  <Dialog
      v-model:visible="show"
      modal
      header="Update Target"
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
      <div class="flex flex-col mb-8">
        <label for="tasks" class="text-lg">Tasks</label>
        <MultiSelect
          input-id="tasks"
          v-model="tasks"
          :options="options"
          option-label="name"
          option-value="code"
          display="chip"
          filter
          placeholder="Select Tasks"
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
