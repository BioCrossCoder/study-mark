import { Button } from "primereact/button";

export default function EditOptionsButton(props: { callback: () => void }) {
  function handleClick() {
    browser.runtime.openOptionsPage();
    props.callback();
  }
  return <Button label="Edit Options" size="small" onClick={handleClick} />;
}
