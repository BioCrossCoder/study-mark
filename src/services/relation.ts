import { StoreKey } from "@/common/enums";
import { Relation } from "@/common/types";
import { relationData } from "@/services/storage/relation";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useRelationQuery() {
  return useQuery({
    queryKey: [StoreKey.Relation],
    queryFn: relationData.getValue,
  });
}

export function useRelationMutation() {
  const { refetch } = useRelationQuery();
  return useMutation({
    mutationFn: relationData.setValue,
    onSuccess() {
      refetch();
    },
  });
}

export function useCreateRelations() {
  const { mutate } = useRelationMutation();
  return async (items: Relation[]) => {
    if (items.length === 0) {
      return;
    }
    const data = await relationData.getValue();
    const [current, toCreate] = [data, items].map(
      (list) => new Set(list.map((item) => JSON.stringify(item))),
    );
    const newData = [...current.union(toCreate)].map(
      (item) => JSON.parse(item) as Relation,
    );
    if (newData.length > data.length) {
      mutate(newData);
    }
  };
}

export function useRemoveRelations() {
  const { mutate } = useRelationMutation();
  return async (items: Relation[]) => {
    if (items.length === 0) {
      return;
    }
    const data = await relationData.getValue();
    const [current, toRemove] = [data, items].map(
      (list) => new Set(list.map((item) => JSON.stringify(item))),
    );
    const newData = [...current.difference(toRemove)].map(
      (item) => JSON.parse(item) as Relation,
    );
    if (newData.length < data.length) {
      mutate(newData);
    }
  };
}
