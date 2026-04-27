import {
  Button,
  Dialog,
  IconField,
  InputIcon,
  InputText,
  ScrollPanel,
  Tree,
  TreeSelect,
} from "primevue";
import { useRouter } from "vue-router";
import { useSelectionStore } from "@/entrypoints/sidepanel/stores/selections";
import { useQuery } from "@tanstack/vue-query";
import { useFavorites } from "../stores/favorites";
import { TreeNode } from "primevue/treenode";
import { useBookmark } from "../stores/bookmark";

export default function FavoritesTree() {
  const container = ref(document.createElement("div"));
  const searchBox = ref({ keyword: "", height: 0, excludeIds: [] });
  const scrollPanelStyle = computed(
    () =>
      `width:100%; height:${container.value.offsetHeight - searchBox.value.height}px`,
  );
  const selectedKeys = useSelectionStore().value;
  const { tree } = useFavorites(searchBox, () => {
    selectedKeys.value = undefined;
  });

  function canEdit(node: TreeNode) {
    const { parentId } =
      node.data as globalThis.Browser.bookmarks.BookmarkTreeNode;
    return parentId != "0";
  }
  const dialog = ref({ open: (_: TreeNode) => {} });
  function handleEdit(event: PointerEvent, node: TreeNode) {
    event.stopPropagation();
    dialog.value.open(node);
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
                v-if="canEdit(node)"
                class="pi pi-pen-to-square mx-2 hover:text-primary-300"
                @click="(event:PointerEvent)=>handleEdit(event,node)"
              />
            </div>
          </template>
        </Tree>
      </ScrollPanel>
      <EditDialog ref="dialog"/>
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

function EditDialog() {
  const show = ref(false);
  const target = ref({} as TreeNode);
  function open(node: TreeNode) {
    show.value = true;
    target.value = node;
  }
  function close() {
    show.value = false;
  }
  vineExpose({
    open,
  });

  const { data } = useBookmark(target);
  const name = ref("");
  const position = ref({} as Record<string, true>);
  const parentId = computed(() => Object.keys(position.value)[0]);
  watch([data], ([value]) => {
    name.value = value?.title ?? "";
    position.value = value ? { [value.parentId as string]: true } : {};
  });
  const dataSource = computed(() => ({
    keyword: "",
    excludeIds: data.value ? [data.value.id] : [],
  }));
  const { folders } = useFavorites(dataSource);

  function handleSubmit() {
    browser.bookmarks.update(target.value.key, {
      title: name.value,
    });
    browser.bookmarks.move(target.value.key, {
      parentId: parentId.value,
    });
    close();
  }

  return vine`
    <Dialog v-model:visible="show" modal header="Edit Bookmark" class=" w-6/7" append-to="self">
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
          inputId="folder"
          v-model="position"
          :options="folders"
          placeholder="Select a folder"
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
