import FavoritesTree from "@/entrypoints/sidepanel/components/FavoritesTree.vine";
import { Button, Menu, Toolbar, TreeSelectionKeys } from "primevue";
import { useSelectionStore } from "../stores/selections";
import { useRouter } from "vue-router";
import CreateFolderDialog from "../components/CreateFolderDialog.vine";
import { useFavoritesQuery } from "@/stores/favorites";
import NavigationGroup from "../components/NavigationGroup.vine";
import { MenuItem } from "primevue/menuitem";

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

  const createFolderDialog = ref({ open: () => {} });
  const menu = ref({ toggle: (_: Event) => {} });
  const items: MenuItem[] = [
    {
      label: "Favorites",
      items: [
        {
          label: "Create Bookmark",
          icon: "pi pi-file-plus",
          command: () => {}, // TODO
        },
        {
          label: "Create Folder",
          icon: "pi pi-folder-plus",
          command: () => createFolderDialog.value.open(),
        },
        {
          label: "Delete Bookmarks",
          icon: "pi pi-trash",
          command: () => {}, // TODO
        },
      ],
    },
  ];
  function toggle(event: Event) {
    menu.value.toggle(event);
  }

  return vine`
    <Toolbar class="border-0!">
      <template #start>
        <NavigationGroup/>
      </template>
      <template #end>
        <div class="flex gap-4">
          <i
            v-if="canOpen"
            class="pi pi-external-link hover:cursor-pointer hover:text-primary-300 "
            @click="handleOpen"
          />
          <i
            class="pi pi-ellipsis-h hover:cursor-pointer hover:text-primary-300"
            @click="toggle"
          />
          <Menu ref="menu" :popup="true" :model="items"/>
        </div>
        <CreateFolderDialog ref="createFolderDialog"/>
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
