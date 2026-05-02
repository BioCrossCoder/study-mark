import { useQuery } from "@tanstack/vue-query";
import { TreeNode } from "primevue/treenode";

export function useBookmarkQuery(node: Ref<TreeNode>) {
  return useQuery({
    queryKey: [node, "bookmark"],
    queryFn: async () => (await browser.bookmarks.get(node.value.key))[0],
  });
}
