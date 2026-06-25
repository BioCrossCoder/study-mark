import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import ReactContainer from "@/components/common/ReactContainer.tsx";
import { gotoBookmark, loadBookmark } from "./logics/bookmark";
import { loadComments } from "./logics/comment";
import { onMessage } from "webext-bridge/content-script";
import { MessageID } from "@/common/enums.ts";
import tippyStyle from "tippy.js/dist/tippy.css?raw";
import { ToastContextProvider } from "@/contexts/content/ToastContext.tsx";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "study-mark-ui",
      position: "overlay",
      anchor: "body",
      onMount(container) {
        // [InjectTippyStyle]
        const style = document.createElement("style");
        style.textContent = tippyStyle;
        document.getElementsByTagName("head").item(0)?.append(style); // [/]
        const app = document.createElement("div");
        container.append(app);
        const root = ReactDOM.createRoot(app);
        root.render(
          <ReactContainer>
            <ToastContextProvider>
              <App />
            </ToastContextProvider>
          </ReactContainer>,
        );
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });
    ui.mount();
    loadComments();
    loadBookmark();
    onMessage(MessageID.LoadProgress, loadBookmark);
    onMessage(MessageID.GotoProgress, gotoBookmark);
    onMessage(MessageID.LoadComment, loadComments);
  },
});
