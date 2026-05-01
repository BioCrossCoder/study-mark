import { useTasksMutation } from "@/stores/tasks";
import { taskSchema } from "@/common/types";
import { useTaskQuery } from "../stores/task";
import { ExecStatus, statusIcon } from "@/common/enums";
import { useNotice } from "@/composables/useNotice";
import { Button, Dialog, InputText, RadioButton } from "primevue";

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
    position.value = value?.position ?? "";
  });

  const { save } = useTasksMutation();
  const { showError } = useNotice();
  function handleSubmit() {
    const form = {
      ...data.value,
      title: title.value,
      state: state.value,
      description: description.value,
      position: position.value,
    };
    const { success, data: newData, error } = taskSchema.safeParse(form);
    if (success) {
      save(newData);
    } else {
      showError("Create Task Failed", error);
    }
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
        <InputText
          id="description"
          v-model="description"
          autocomplete="off"
          class="flex-auto h-10 text-base!"
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
        <label for="position" class="text-lg">Position</label>
        <InputText
          id="position"
          v-model="position"
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
