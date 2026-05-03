import { useFavoritesQuery } from "@/stores/favorites";
import { Button, Dialog, TreeSelect } from "primevue";

export default function DeleteBookmarksDialog() {
  const show = ref(false);
  function open() {
    show.value = true;
  }
  function close() {
    show.value = false;
    items.value = {};
  }
  vineExpose({
    open,
  });

  const items = ref({} as Record<string, true>);
  const dataSource = ref({
    keyword: "",
    excludeIds: [],
  });
  const { tree } = useFavoritesQuery(dataSource, () => {});
  const disabled = computed(() => Object.keys(items.value).length === 0);
  function handleSubmit() {
    Object.keys(items.value).forEach((id) => {
      try {
        browser.bookmarks.removeTree(id);
      } catch {}
    });
    close();
  }

  return vine`
    <Dialog
      v-model:visible="show"
      modal
      header="Delete Bookmarks"
      class="w-6/7"
      append-to="self"
      :draggable="false"
    >
      <TreeSelect
        v-model="items"
        :options="tree"
        placeholder="Select bookmarks"
        class="w-full h-10 text-base! mb-8"
        selection-mode="multiple"
        filter
      />
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="close"/>
        <Button label="Delete" @click="handleSubmit" :disabled="disabled"/>
      </div>
    </Dialog>
`;
}
