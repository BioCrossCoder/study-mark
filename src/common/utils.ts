export function send<T>(port: globalThis.Browser.runtime.Port, message: T) {
  port.postMessage(message);
}
