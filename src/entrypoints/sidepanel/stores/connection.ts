import { Channel } from "@/common/enums";
import { defineVibe } from "vue-vine";

export const [useConnectionStore, initConnectionStore] = defineVibe(
  "connection",
  () => {
    const port = browser.runtime.connect({ name: Channel.SidePanel });
    const listeners = new Array<MessageCallback>();
    function listen(callback: MessageCallback) {
      if (port.onMessage.hasListener(callback)) {
        return;
      }
      port.onMessage.addListener(callback);
      listeners.push(callback);
    }
    function close() {
      listeners.forEach(port.onMessage.removeListener);
      port.disconnect();
    }
    return {
      listen,
      close,
      port,
    };
  },
);

type MessageCallback = (
  message: any,
  port: globalThis.Browser.runtime.Port,
) => void;
