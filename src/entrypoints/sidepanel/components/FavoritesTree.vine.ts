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
  const isKeywordEmpty = computed(() => keyword.value.length === 0);
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
  function enterChatPage() {
    router.push("/sidepanel");
  }
  function handleClear() {
    keyword.value = "";
  }
  return vine`
    <div class="h-screen flex flex-col overflow-hidden">
      <Toolbar>
        <template #start>
          <i 
            class="pi pi-comments hover:cursor-pointer hover:text-primary-300"
            @click="enterChatPage"
          />
        </template>
        <template #center>
          <IconField>
            <InputIcon class="pi pi-search"/>
            <InputText v-model="keyword" placeholder="Search"/>
            <InputIcon v-if="!isKeywordEmpty">
              <i class="pi pi-times-circle hover:cursor-pointer hover:text-red-300" @click="handleClear"/>
            </InputIcon>
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
                  @click="()=>handleOpen(data,selectedKeys)"
                />
                <i
                  class="pi pi-folder-plus mx-2 hover:cursor-pointer hover:text-primary-300 "
                  @click="handleAddFolder"
                />
                <i
                  class="pi pi-trash mx-2 hover:cursor-pointer hover:text-red-400 "
                  @click="()=>handleDelete(data,selectedKeys)"
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
                @click="(event:PointerEvent)=>handleEdit(event,node)"
              />
            </div>
          </template>
        </Tree>
      </ScrollPanel>
    </div>
  `;
}

function handleOpen(
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

function handleAddFolder() {
  // TODO open creating folder dialog
}

type TreeSelection = {
  checked: boolean;
  partialChecked: boolean;
};

function handleDelete(
  value: globalThis.Browser.bookmarks.BookmarkTreeNode[],
  selectionKeys?: TreeSelectionKeys,
) {
  // TODO add confirm
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

function handleEdit(event: PointerEvent, node: TreeNode) {
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
