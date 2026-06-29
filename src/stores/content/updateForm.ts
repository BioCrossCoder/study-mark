import { create } from "zustand";

type UpdateFormStore = {
  visible: boolean;
  id: string;
  open: (defaultContent: string) => void;
  close: () => void;
};

export const useUpdateFormStore = create<UpdateFormStore>((set) => ({
  visible: false,
  id: "",
  open: (id: string) => set({ id, visible: true }),
  close: () => set({ id: "", visible: false }),
}));
