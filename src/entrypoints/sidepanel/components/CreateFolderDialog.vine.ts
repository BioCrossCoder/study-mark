import { useBookmarkQuery } from "../stores/bookmark";
import { Button, Dialog, InputText, TreeSelect } from "primevue";
import { useFavoritesQuery } from "@/stores/favorites";

export default function CreateFolderDialog() {
  const show = ref(false);
  function open() {
    show.value = true;
  }
  function close() {
    show.value = false;
    name.value = "";
    position.value = {};
  }
  vineExpose({
    open,
  });

  const name = ref("");
  const position = ref({} as Record<string, true>);
  const parentId = computed(() => Object.keys(position.value)[0]);

  const dataSource = ref({
    keyword: "",
    excludeIds: [],
  });
  const { folders } = useFavoritesQuery(dataSource);

  const disabled = computed(() => name.value.length === 0 || !parentId.value);
  function handleSubmit() {
    browser.bookmarks.create({
      title: name.value,
      parentId: parentId.value,
    });
    close();
  }

  return vine`
    <Dialog
      v-model:visible="show"
      modal
      header="Create Folder"
      class="w-6/7"
      append-to="self"
      :draggable="false"
    >
      <div class="flex flex-col mb-4">
        <label for="name" class="text-lg">Name</label>
        <InputText
          id="name"
          v-model="name"
          autocomplete="off"
          class="flex-auto h-10 text-base!"
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="folder" class="text-lg">Folder</label>
        <TreeSelect
          input-id="folder"
          v-model="position"
          :options="folders"
          placeholder="Select a folder"
          class="flex-auto h-10 text-base!"
        />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="close"/>
        <Button label="Save" @click="handleSubmit" :disabled="disabled"/>
      </div>
    </Dialog>
  `;
}
