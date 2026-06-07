import { StoreKey } from "@/common/enums";
import { useQuery } from "@tanstack/react-query";
import { tabIndexData } from "./storage/tabIndex";

export function useTabIndexQuery() {
  const query = useQuery({
    queryKey: [StoreKey.TabIndex],
    queryFn: tabIndexData.getValue,
  });
  useEffect(() =>
    tabIndexData.watch(() => {
      query.refetch();
    }),
  );
  return query;
}
