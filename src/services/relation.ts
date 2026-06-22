import { useWxtStore } from "@/hooks/common/useWxtStore";
import { relationData } from "@/services/storage/relation";

export function useRelationData() {
  return useWxtStore(relationData);
}

export function useRelationsOfAllTasks() {
  const data = useRelationData();
  const records = {} as Record<string, string[]>;
  (data ?? []).forEach(({ targetId, taskId }) => {
    records[taskId] = [...(records[taskId] ?? []), targetId];
  });
  return records;
}

export function useRelationsOfAllTargets() {
  const data = useRelationData();
  const records = {} as Record<string, string[]>;
  (data ?? []).forEach(({ targetId, taskId }) => {
    records[targetId] = [...(records[targetId] ?? []), taskId];
  });
  return records;
}
