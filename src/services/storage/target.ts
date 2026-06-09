import { StoreKey } from "@/common/enums";
import { Target } from "@/common/types";

export const targetData = storage.defineItem<Record<string, Target>>(
  StoreKey.Target,
  {
    fallback: {},
  },
);

export async function removeTarget(id: string) {
  const data = await targetData.getValue();
  delete data[id];
  await targetData.setValue(data);
}
