import { StoreKey } from "@/common/enums";
import { useQuery } from "@tanstack/react-query";
import { commentData } from "./storage/comment";
import { positionMatch } from "@/common/utils";

export function useCommentQuery() {
  const query = useQuery({
    queryKey: [StoreKey.Comment],
    queryFn: commentData.getValue,
  });
  useEffect(() =>
    commentData.watch(() => {
      query.refetch();
    }),
  );
  return query;
}

export function useCommentUrls() {
  const { data } = useCommentQuery();
  const urls = new Array<string>();
  (data ?? []).forEach(({ url }) => {
    if (!urls.some((item) => positionMatch(item, url))) {
      urls.push(url);
    }
  });
  return urls;
}
