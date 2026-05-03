import FavoritesTree from "@/entrypoints/sidepanel/components/FavoritesTree.vine";
import { Toolbar, TreeSelectionKeys } from "primevue";
import { useSelectionStore } from "../stores/selections";
import { useRouter } from "vue-router";
import CreateFolderDialog from "../components/CreateFolderDialog.vine";
import { useFavoritesQuery } from "@/stores/favorites";
import NavigationGroup from "../components/NavigationGroup.vine";

export default function Page() {
  return vine`
    <div class="h-screen flex flex-col overflow-hidden">
      <TopBar/>
      <FavoritesTree class="grow"/>
    </div>
  `;
}

function TopBar() {
  const { data } = useFavoritesQuery(ref({ keyword: "", excludeIds: [] }));
  const selectedKeys = useSelectionStore().value;
  const pages = usePages(data, selectedKeys);
  const canOpen = computed(() => pages.value.length > 0);
  function handleOpen() {
    pages.value.forEach((url) => browser.tabs.create({ url }));
  }

  const dialog = ref({ open: () => {} });
  function handleCreateFolder() {
    dialog.value.open();
  }

  return vine`
    <Toolbar class="border-0!">
      <template #start>
        <NavigationGroup/>
      </template>
      <template #end>
        <i
          v-if="canOpen"
          class="pi pi-external-link mx-2 hover:cursor-pointer hover:text-primary-300 "
          @click="handleOpen"
        />
        <i
          class="pi pi-folder-plus ml-2 hover:cursor-pointer hover:text-primary-300 "
          @click="handleCreateFolder"
        />
        <CreateFolderDialog ref="dialog"/>
      </template>
    </Toolbar>
  `;
}

function usePages(
  tree: Ref<globalThis.Browser.bookmarks.BookmarkTreeNode[] | undefined>,
  selectionKeys: Ref<TreeSelectionKeys | undefined>,
) {
  return computed(() => {
    const urls = new Array<string>();
    function dfs(nodes: globalThis.Browser.bookmarks.BookmarkTreeNode[]) {
      if (!selectionKeys.value) {
        return;
      }
      nodes.forEach((node) => {
        if (!selectionKeys.value![node.id]) {
          return;
        }
        if (node.url) {
          urls.push(node.url);
        }
        dfs(node.children ?? []);
      });
    }
    dfs(tree.value ?? []);
    return urls;
  });
}
