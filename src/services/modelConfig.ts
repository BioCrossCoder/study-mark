import { useWxtStore } from "@/hooks/useWxtStore";
import { modelConfigData } from "./storage/modelConfig";

export function useModelConfigData() {
  return useWxtStore(modelConfigData);
}
