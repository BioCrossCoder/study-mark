import FavoritesTree from "@/entrypoints/sidepanel/components/FavoritesTree.vine";
import { Toolbar, TreeSelectionKeys } from "primevue";
import { useSelectionStore } from "../stores/selections";
import { useRouter } from "vue-router";
import { useFavorites } from "../stores/favorites";
import CreateFolderDialog from "../components/CreateFolderDialog.vine";

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

  const { data } = useFavorites(ref({ keyword: "", excludeIds: [] }));
  const selectedKeys = useSelectionStore().value;

  const dialog = ref({ open: () => {} });
  function handleCreateFolder() {
    dialog.value.open();
  }

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
          @click="handleCreateFolder"
        />
        <CreateFolderDialog ref="dialog"/>
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
