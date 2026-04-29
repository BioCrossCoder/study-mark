import { Button, InputText, Panel, TreeSelect } from "primevue";
import { useFavoritesQuery } from "@/stores/favorites";

export default function SaveBookmarkDialog() {
  function close() {
    window.close();
  }

  const name = ref("");
  const url = ref("");
  const position = ref({} as Record<string, true>);
  const parentId = computed(() => Object.keys(position.value)[0]);
  const dataSource = ref({
    keyword: "",
    excludeIds: [],
  });
  const { folders } = useFavoritesQuery(dataSource);
  onMounted(async () => {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    name.value = tab.title ?? "";
    url.value = tab.url ?? "";
    position.value = { [folders.value[0].key]: true };
  });

  function handleSubmit() {
    browser.bookmarks.create({
      title: name.value,
      url: url.value,
      parentId: parentId.value,
    });
    close();
  }

  return vine`
    <Panel class="w-100">
      <template #header>
        <div class="w-full flex justify-between items-center">
          <p class="font-semibold text-xl">Create Bookmark</p>
          <Button
            icon="pi pi-times"
            severity="secondary"
            variant="text"
            rounded
            @click="close"
          />
        </div>
      </template>
      <div class="flex items-center mb-4">
        <label for="name" class="text-lg w-20">Name</label>
        <InputText
          id="name"
          v-model="name"
          autocomplete="off"
          class="flex-auto text-base!"
        />
      </div>
      <div class="flex items-center mb-4">
        <label for="folder" class="text-lg w-20">Folder</label>
        <TreeSelect
          input-id="folder"
          v-model="position"
          :options="folders"
          class="flex-auto h-10 text-base!"
        />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="close"/>
        <Button label="Save" @click="handleSubmit"/>
      </div>
    </Panel>
  `;
}
