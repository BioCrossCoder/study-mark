import { TreeSelectionKeys } from "primevue";
import { defineVibe } from "vue-vine";

export const [useSelectionStore, initSelectionStore] = defineVibe(
  "selection",
  () => {
    const value = ref<TreeSelectionKeys>();
    return {
      value,
    };
  },
);
