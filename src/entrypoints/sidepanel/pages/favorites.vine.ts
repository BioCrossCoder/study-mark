import FavoritesTree from "@/entrypoints/sidepanel/components/FavoritesTree.vine";
import { Toolbar, TreeSelectionKeys } from "primevue";
import { useSelectionStore } from "../stores/selections";
import { useRouter } from "vue-router";
import { useFavorites } from "../stores/favorites";

export default function Page() {
  return vine`
    <div class="h-screen flex flex-col overflow-hidden">
      <TopBar/>
      <FavoritesTree class="grow"/>
    </div>
  `;
}

function TopBar() {
  const router = useRouter();
  function enterChatPage() {
    router.push("/sidepanel");
  }

  const { data } = useFavorites(ref({ keyword: "" }));
  const selectedKeys = useSelectionStore().value;

  return vine`
    <Toolbar>
      <template #start>
        <i
          class="pi pi-comments hover:cursor-pointer hover:text-primary-300"
          @click="enterChatPage"
        />
      </template>
      <template #center>
        <i
          class="pi pi-external-link mx-2 hover:cursor-pointer hover:text-primary-300 "
          @click="()=>handleOpen(data??[],selectedKeys)"
        />
        <i
          class="pi pi-folder-plus mx-2 hover:cursor-pointer hover:text-primary-300 "
          @click="handleAddFolder"
        />
        <i
          class="pi pi-trash mx-2 hover:cursor-pointer hover:text-red-400 "
          @click="()=>handleDelete(data??[],selectedKeys)"
        />
      </template>
    </Toolbar>
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
