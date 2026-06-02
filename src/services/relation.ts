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

export function useRemoveRelationsOfTask() {
  const { mutate } = useRelationMutation();
  return async (id: string) => {
    const data = await relationData.getValue();
    mutate(data.filter(({ taskId }) => taskId !== id));
  };
}

export function useRemoveRelationsOfTarget() {
  const { mutate } = useRelationMutation();
  return async (id: string) => {
    const data = await relationData.getValue();
    mutate(data.filter(({ targetId }) => targetId !== id));
  };
}

export function useRelationsOfTask(id: string) {
  const { data } = useRelationQuery();
  return (data ?? []).filter(({ taskId }) => taskId === id);
}

export function useRelationsOfTarget(id: string) {
  const { data } = useRelationQuery();
  return (data ?? []).filter(({ targetId }) => targetId === id);
}

export function useRelationsOfAllTasks() {
  const { data } = useRelationQuery();
  const records = {} as Record<string, string[]>;
  (data ?? []).forEach(({ targetId, taskId }) => {
    records[taskId] = [...(records[taskId] ?? []), targetId];
  });
  return records;
}

export function useRelationsOfAllTargets() {
  const { data } = useRelationQuery();
  const records = {} as Record<string, string[]>;
  (data ?? []).forEach(({ targetId, taskId }) => {
    records[targetId] = [...(records[targetId] ?? []), taskId];
  });
  return records;
}
