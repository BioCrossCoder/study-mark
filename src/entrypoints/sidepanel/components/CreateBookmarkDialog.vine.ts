import { Button, Dialog, InputText, TreeSelect } from "primevue";
import { useFavoritesQuery } from "@/stores/favorites";

export default function CreateBookmarkDialog() {
  const show = ref(false);
  function open() {
    show.value = true;
  }
  function close() {
    show.value = false;
    name.value = "";
    url.value = "";
    position.value = {};
  }
  vineExpose({
    open,
  });

  const name = ref("");

  const url = ref("");
  async function handleSetUrl() {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    url.value = tab.url ?? url.value;
    name.value = tab.title ?? name.value;
  }

  const position = ref({} as Record<string, true>);
  const parentId = computed(() => Object.keys(position.value)[0]);

  const dataSource = ref({
    keyword: "",
    excludeIds: [],
  });
  const { folders } = useFavoritesQuery(dataSource);

  const disabled = computed(
    () => name.value.length * url.value.length === 0 || !parentId.value,
  );
  function handleSubmit() {
    browser.bookmarks.create({
      title: name.value,
      url: url.value,
      parentId: parentId.value,
    });
    close();
  }

  return vine`
    <Dialog
      v-model:visible="show"
      modal
      header="Create Bookmark"
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
        <label for="url" class="text-lg flex items-center">
          <p>URL</p>
          <i
            class="pi pi-star hover:cursor-pointer hover:text-primary-300 mx-2"
            @click="handleSetUrl"
          />
        </label>
        <InputText
          id="url"
          v-model="url"
          autocomplete="off"
          class="flex-auto h-10 text-base!"
          autofocus
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
