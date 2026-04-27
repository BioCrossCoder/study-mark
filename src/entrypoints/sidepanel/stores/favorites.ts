import { useQuery } from "@tanstack/vue-query";
import { TreeNode } from "primevue/treenode";

export function useFavorites(
  dataSource: Ref<{ keyword: string; excludeIds: string[] }>,
) {
  const query = useQuery({
    queryKey: [dataSource],
    queryFn: async () => {
      const { keyword } = dataSource.value;
      return keyword
        ? await browser.bookmarks.search(keyword)
        : ((await browser.bookmarks.getTree()).at(0)?.children ?? []);
    },
  });

  const tree = computed(() => showFavorites(query.data.value ?? []));
  const folders = computed(() =>
    showFavorites(query.data.value ?? [], true, dataSource.value.excludeIds),
  );
  return { ...query, tree, folders };
}

function showFavorites(
  data: globalThis.Browser.bookmarks.BookmarkTreeNode[],
  folderOnly: boolean = false,
  excludeIds: string[] = [],
): TreeNode[] {
  return data
    .filter(
      (node) => (!folderOnly || !node.url) && !excludeIds.includes(node.id),
    )
    .map((node) => {
      return {
        key: node.id,
        label: node.title,
        children: showFavorites(node.children ?? [], folderOnly, excludeIds),
        data: node,
      };
    });
}
