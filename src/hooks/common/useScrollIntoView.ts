import { RefObject, useEffectEvent } from "react";

export function useScrollIntoView<T extends HTMLElement>(ref: RefObject<T>) {
  return useEffectEvent(() => {
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  });
}
