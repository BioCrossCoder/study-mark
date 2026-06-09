import { StoreKey } from "@/common/enums";
import { Relation } from "@/common/types";

export const relationData = storage.defineItem<Relation[]>(StoreKey.Relation, {
  fallback: [],
});

export async function createRelations(items: Relation[]) {
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
    await relationData.setValue(newData);
  }
}

export async function removeRelationsOfTask(id: string) {
  const data = await relationData.getValue();
  await relationData.setValue(data.filter(({ taskId }) => taskId !== id));
}

export async function removeRelationsOfTarget(id: string) {
  const data = await relationData.getValue();
  await relationData.setValue(data.filter(({ targetId }) => targetId !== id));
}
