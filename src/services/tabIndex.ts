import { tabIndexData } from "./storage/tabIndex";

export function useTabIndexData() {
  return useWxtStore(tabIndexData);
}
