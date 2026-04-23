import {
  IconField,
  InputIcon,
  InputText,
  ScrollPanel,
  Toolbar,
  Tree,
  TreeSelectionKeys,
} from "primevue";
import { TreeNode } from "primevue/treenode";
import { useFavoritesDataSync } from "@/composables/useFavoritesDataSync";
import { useRouter } from "vue-router";
import { useSelectionStore } from "@/entrypoints/sidepanel/stores/selections";

export default function FavoritesTree() {
  const keyword = ref("");
  const data = ref(new Array<globalThis.Browser.bookmarks.BookmarkTreeNode>());
  const refresh = async (value: string) => {
    data.value = await loadFavorites(value);
  };
  onMounted(async () => {
    await refresh(keyword.value);
  });
  watch(keyword, async (value) => {
    await refresh(value);
  });
  useFavoritesDataSync(
    () => refresh(keyword.value),
    () => {
      selectedKeys.value = undefined;
    },
  );
  const nodes = computed(() => showFavorites(data.value));
  const selectedKeys = useSelectionStore().value;
  const router = useRouter();
  function onClickChat() {
    router.push("/sidepanel");
  }
  return vine`
    <div class="h-screen flex flex-col overflow-hidden">
      <Toolbar>
        <template #start>
          <i 
            class="pi pi-comments hover:cursor-pointer hover:text-primary-300"
            @click="onClickChat"
          />
        </template>
        <template #center>
          <IconField>
            <InputIcon class="pi pi-search"/>
            <InputText v-model="keyword" placeholder="Search"/>
          </IconField>
        </template>
        <template #end>
          <i class="pi pi-star-fill"/>
        </template>
      </Toolbar>
      <ScrollPanel style="width: 100%; height: 100%">
        <Tree
          v-model:selectionKeys="selectedKeys"
          class="w-full h-full"
          :value="nodes"
          selectionMode="checkbox"
        >
          <template #header>
            <Toolbar>
              <template #center>
              <div class="flex justify-around">
                <i
                  class="pi pi-external-link mx-2 hover:cursor-pointer hover:text-primary-300 "
                  @click="()=>onClickOpen(data,selectedKeys)"
                />
                <i
                  class="pi pi-folder-plus mx-2 hover:cursor-pointer hover:text-primary-300 "
                  @click="onClickAddFolder"
                />
                <i
                  class="pi pi-trash mx-2 hover:cursor-pointer hover:text-red-400 "
                  @click="()=>onClickDelete(data,selectedKeys)"
                />
              </div>
              </template>
            </Toolbar>
          </template>
          <template #default="{node}">
            <div class="flex justify-between">
              <div>{{node.label}}</div>
              <i
                class="pi pi-pen-to-square mx-2 hover:text-primary-300"
                @click="(event:PointerEvent)=>onClickEdit(event,node)"
              />
            </div>
          </template>
        </Tree>
      </ScrollPanel>
    </div>
  `;
}

function onClickOpen(
  value: globalThis.Browser.bookmarks.BookmarkTreeNode[],
  selectionKeys?: TreeSelectionKeys,
) {
  function dfs(nodes: globalThis.Browser.bookmarks.BookmarkTreeNode[]) {
    if (!selectionKeys) {
      return;
    }
    nodes.forEach((node) => {
      if (!selectionKeys[node.id]) {
        return;
      }
      if (node.url) {
        browser.tabs.create({ url: node.url });
      }
      dfs(node.children ?? []);
    });
  }
  dfs(value);
}

function onClickAddFolder() {
  // TODO open creating folder dialog
}

type TreeSelection = {
  checked: boolean;
  partialChecked: boolean;
};

function onClickDelete(
  value: globalThis.Browser.bookmarks.BookmarkTreeNode[],
  selectionKeys?: TreeSelectionKeys,
) {
  function dfs(nodes: globalThis.Browser.bookmarks.BookmarkTreeNode[]) {
    if (!selectionKeys) {
      return;
    }
    nodes.forEach((node) => {
      const item: TreeSelection | undefined = selectionKeys[node.id];
      if (!item) {
        return;
      }
      if (item.checked) {
        if (node.url) {
          browser.bookmarks.remove(node.id);
        } else {
          browser.bookmarks.removeTree(node.id);
        }
        return;
      }
      if (item.partialChecked) {
        dfs(node.children!);
      }
    });
  }
  dfs(value);
}

function onClickEdit(event: PointerEvent, node: TreeNode) {
  event.stopPropagation();
  // TODO open editing bookmark dialog
}

async function loadFavorites(keyword: string) {
  return keyword
    ? await browser.bookmarks.search(keyword)
    : ((await browser.bookmarks.getTree()).at(0)?.children ?? []);
}

function showFavorites(
  data: globalThis.Browser.bookmarks.BookmarkTreeNode[],
): TreeNode[] {
  return data.map((node) => ({
    key: node.id,
    label: node.title,
    children: showFavorites(node.children ?? []),
  }));
}
