import { Channel, ConnectionListener } from "@/common/enums";
import { defineVibe } from "vue-vine";

const port = browser.runtime.connect({ name: Channel.SidePanel });
export const [useConnectionStore, initConnectionStore] = defineVibe(
  "connection",
  () => {
    const listeners = new Map<ConnectionListener, MessageCallback>();
    function listen(key: ConnectionListener, callback: MessageCallback) {
      if (listeners.has(key)) {
        return;
      }
      port.onMessage.addListener(callback);
      listeners.set(key, callback);
    }
    function close() {
      listeners.forEach((callback) => port.onMessage.removeListener(callback));
      listeners.clear();
      port.disconnect();
    }
    function send<T>(message: T) {
      port.postMessage(message);
    }
    return {
      send,
      listen,
      close,
    };
  },
);

type MessageCallback = (
  message: any,
  port: globalThis.Browser.runtime.Port,
) => void;
