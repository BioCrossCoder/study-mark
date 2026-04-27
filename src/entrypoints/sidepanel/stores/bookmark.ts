import { useQuery } from "@tanstack/vue-query";
import { TreeNode } from "primevue/treenode";

export function useBookmark(node: Ref<TreeNode>) {
  return useQuery({
    queryKey: [node],
    queryFn: async () => (await browser.bookmarks.get(node.value.key))[0],
  });
}
