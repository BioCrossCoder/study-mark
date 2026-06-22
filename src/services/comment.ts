import { commentData } from "./storage/comment";
import { positionMatch } from "@/common/utils";
import { useWxtStore } from "@/hooks/common/useWxtStore";

export function useCommentData() {
  return useWxtStore(commentData);
}

export function useCommentUrls() {
  const data = useCommentData();
  const urls = new Array<string>();
  (data ?? []).forEach(({ url }) => {
    if (!urls.some((item) => positionMatch(item, url))) {
      urls.push(url);
    }
  });
  return urls;
}
