import { uiStateData } from "./storage/uiState";

export function useUiStateData() {
  return useWxtStore(uiStateData);
}
