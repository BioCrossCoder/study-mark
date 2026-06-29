import { create } from "zustand";

type HoverMessageStore = {
  content: string;
  update: (content: string) => void;
};

export const useHoverMessageStore = create<HoverMessageStore>((set) => ({
  content: "",
  update: (content: string) => set({ content }),
}));
