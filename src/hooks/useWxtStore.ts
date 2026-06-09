import { useSyncExternalStore } from "react";

export function useWxtStore<T>(
  wxtStorageItem: globalThis.WxtStorageItem<T, {}>,
) {
  const [state, setState] = useState(wxtStorageItem.fallback);
  useEffect(() => {
    wxtStorageItem.getValue().then((value) => setState(value));
  }, []);
  return useSyncExternalStore(
    () => wxtStorageItem.watch((v) => setState(v)),
    () => state,
  );
}
