import { useWxtStore } from "@/hooks/common/useWxtStore";
import { uiStateData } from "./storage/uiState";

export function useUiStateData() {
  return useWxtStore(uiStateData);
}
