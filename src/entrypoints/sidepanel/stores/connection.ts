import { Channel, ConnectionListener } from "@/common/enums";
import { defineVibe } from "vue-vine";

class Connection {
  constructor(
    private listeners = new Map<ConnectionListener, MessageCallback>(),
    private port = this.connect(),
  ) {
    this.autoReconnect();
  }
  private connect() {
    return browser.runtime.connect({ name: Channel.SidePanel });
  }
  private autoReconnect() {
    this.port.onDisconnect.addListener(() => {
      this.port = this.connect();
      this.listeners.forEach((callback) =>
        this.port.onMessage.addListener(callback),
      );
      this.autoReconnect();
    });
  }
  public get onMessage() {
    return this.port.onMessage;
  }
  public disconnect() {
    return this.port.disconnect();
  }
  public postMessage<T>(message: T) {
    return this.port.postMessage(message);
  }
}

const port = new Connection();
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
