export function useScroll<T extends HTMLElement>(
  anchor: T | Ref<T>,
  behavior: ScrollBehavior,
  block: ScrollLogicalPosition,
) {
  if (isRef(anchor)) {
    anchor.value.scrollIntoView({
      behavior,
      block,
    });
  } else {
    anchor.scrollIntoView({
      behavior,
      block,
    });
  }
}
