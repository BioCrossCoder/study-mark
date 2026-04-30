export const chatContext = storage.defineItem<
  { role: "user" | "assistant"; content: string }[]
>("session:chatContext", {
  fallback: [],
});
