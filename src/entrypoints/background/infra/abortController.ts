export function createAbortController() {
  let c: AbortController | null = null;
  function stop() {
    if (!c) {
      return;
    }
    c.abort();
  }
  function init() {
    c = new AbortController();
  }
  function end() {
    return c?.signal.aborted ?? false;
  }
  return {
    init,
    stop,
    end,
  };
}
