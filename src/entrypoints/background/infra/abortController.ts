export function createAbortController() {
  let c: AbortController | null = null;
  function stop(callback?: () => void) {
    if (c) {
      c.abort();
    }
    if (callback) {
      callback();
    }
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
