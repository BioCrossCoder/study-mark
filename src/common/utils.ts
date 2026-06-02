export function sortBy<K extends string, T extends Record<K, number>>(
  field: K,
) {
  return (obj1: T, obj2: T) => obj1[field] - obj2[field];
}

export function isItemExist<K extends string, T extends Record<K, string>>(
  item: T,
  field: K,
  data: T[],
) {
  return data.some((record) => record[field] === item[field]);
}

export function mergeObj(obj1: object, obj2: object) {
  return { ...obj1, ...obj2 };
}
