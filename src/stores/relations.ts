import { useMutation, useQuery } from "@tanstack/vue-query";

const relationData = storage.defineItem<[string, string][]>(
  "local:relationData",
  {
    fallback: [],
  },
);

export function useRelationsQuery() {
  const query = useQuery({
    queryKey: ["relations"],
    queryFn: relationData.getValue,
  });
  const mapping = computed(() => {
    const records = {} as Record<string, string[]>;
    console.log(query.data.value);
    (query.data.value ?? []).forEach(([id1, id2]) => {
      records[id1] = [...(records[id1] ?? []), id2];
      records[id2] = [...(records[id2] ?? []), id1];
    });
    return records;
  });
  return { ...query, mapping };
}

export function useRelationsMutation() {
  const { refetch } = useRelationsQuery();
  const mutation = useMutation({
    mutationFn: relationData.setValue,
    onSuccess() {
      refetch();
    },
  });

  async function add(items: [string, string][]) {
    if (items.length === 0) {
      return;
    }
    const data = await relationData.getValue();
    const [current, toCreate] = [data, items].map(
      (list) => new Set(list.map((item) => JSON.stringify(item.toSorted()))),
    );
    const newData = [...current.union(toCreate)].map(
      (item) => JSON.parse(item) as [string, string],
    );
    mutation.mutate(newData);
  }

  async function remove(items: [string, string][]) {
    if (items.length === 0) {
      return;
    }
    const data = await relationData.getValue();
    const [current, toRemove] = [data, items].map(
      (list) => new Set(list.map((item) => JSON.stringify(item.toSorted()))),
    );
    const newData = [...current.difference(toRemove)].map(
      (item) => JSON.parse(item) as [string, string],
    );
    mutation.mutate(newData);
  }

  return { ...mutation, add, remove };
}
