import {
  Dialog,
  IconField,
  InputIcon,
  InputText,
  ScrollPanel,
  Tree,
  TreeSelect,
} from "primevue";
import { TreeNode } from "primevue/treenode";
import { useFavoritesDataSync } from "@/composables/useFavoritesDataSync";
import { useRouter } from "vue-router";
import { useSelectionStore } from "@/entrypoints/sidepanel/stores/selections";
import { useQuery } from "@tanstack/vue-query";
import { useFavorites } from "../stores/favorites";

export default function FavoritesTree() {
  const container = ref(document.createElement("div"));
  const searchBox = ref({ keyword: "", height: 0 });
  const scrollPanelStyle = computed(
    () =>
      `width:100%; height:${container.value.offsetHeight - searchBox.value.height}px`,
  );
  const { data, refetch, tree } = useFavorites(searchBox);
  const selectedKeys = useSelectionStore().value;
  useFavoritesDataSync(refetch, () => {
    selectedKeys.value = undefined;
  });

  const dialog = ref({ open: () => {} });
  function handleEdit(event: PointerEvent) {
    event.stopPropagation();
    dialog.value.open();
  }

  return vine`
    <div class="flex flex-col overflow-hidden" ref="container">
      <SearchBox ref="searchBox"/>
      <ScrollPanel :style="scrollPanelStyle">
        <Tree
          v-model:selectionKeys="selectedKeys"
          class="w-full h-full bg-transparent!"
          :value="tree"
          selectionMode="checkbox"
        >
          <template #default="{node}">
            <div class="flex justify-between">
              <div>{{node.label}}</div>
              <i
                class="pi pi-pen-to-square mx-2 hover:text-primary-300"
                @click="handleEdit"
              />
              <EditDialog ref="dialog" :id="node.key"/>
            </div>
          </template>
        </Tree>
      </ScrollPanel>
    </div>
  `;
}

function SearchBox() {
  const keyword = ref("");
  const isKeywordEmpty = computed(() => keyword.value.length === 0);
  function handleClear() {
    keyword.value = "";
  }

  const container = ref(document.createElement("div"));
  const height = computed(() => container.value.offsetHeight);

  vineExpose({
    keyword,
    height,
  });

  return vine`
    <div ref="container">
      <IconField class="m-2">
        <InputIcon class="pi pi-search"/>
        <InputText v-model="keyword" placeholder="Search" class="w-full"/>
        <InputIcon v-if="!isKeywordEmpty">
          <i class="pi pi-times-circle hover:cursor-pointer hover:text-red-300" @click="handleClear"/>
        </InputIcon>
      </IconField>
    </div>
  `;
}

function EditDialog(props: { id: string }) {
  const edit = ref(false);
  const position = ref();
  const { tree } = useFavorites(ref({ keyword: "" }));

  function open() {
    edit.value = true;
  }
  vineExpose({
    open,
  });

  return vine`
    <Dialog v-model:visible="edit" modal header="Edit Bookmark">
      <div class="flex items-center gap-4 mb-2">
        <label for="name" class="font-semibold w-8">Name</label>
        <InputText id="name" autocomplete="off" class="flex-auto h-10"/>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="folder" class="font-semibold w-8">Folder</label>
        <TreeSelect
          v-model="position"
          :options="tree"
          placeholder="Select a folder"
          class="flex-auto h-10"
        />
      </div>
    </Dialog>
  `;
}
