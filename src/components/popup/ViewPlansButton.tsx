import { TabIndex } from "@/common/enums";
import { tabIndexData } from "@/services/storage/tabIndex";
import { Button } from "primereact/button";

export default function ViewPlansButton(props: { callback: () => void }) {
  async function handleClick() {
    await tabIndexData.setValue(TabIndex.List);
    browser.sidePanel.open({
      windowId: browser.windows.WINDOW_ID_CURRENT,
    });
    props.callback();
  }
  return <Button label="View Plans" size="small" onClick={handleClick} />;
}
