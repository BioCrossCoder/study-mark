import { useWxtStore } from "@/hooks/common/useWxtStore";
import { modelConfigData } from "./storage/modelConfig";

export function useModelConfigData() {
  return useWxtStore(modelConfigData);
}
