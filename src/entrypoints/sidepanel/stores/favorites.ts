import { useQuery } from "@tanstack/vue-query";
import { TreeNode } from "primevue/treenode";

export function useFavorites(dataSource: Ref<{ keyword: string }>) {
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
  return { ...query, tree };
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
