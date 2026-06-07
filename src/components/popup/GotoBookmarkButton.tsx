import { MessageID } from "@/common/enums";
import { getCurrentTab } from "@/common/utils";
import { Button } from "primereact/button";
import { sendMessage } from "webext-bridge/popup";

export default function GotoBookmarkButton(props: { callback: () => void }) {
  async function handleClick() {
    const tab = await getCurrentTab();
    sendMessage(MessageID.GotoProgress, null, {
      context: "content-script",
      tabId: tab?.id ?? browser.tabs.TAB_ID_NONE,
    });
    props.callback();
  }
  return <Button label="Go to Bookmark" size="small" onClick={handleClick} />;
}
