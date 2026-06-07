import EditOptionsButton from "@/components/popup/EditOptionsButton";
import GotoBookmarkButton from "@/components/popup/GotoBookmarkButton";
import ViewPlansButton from "@/components/popup/ViewPlansButton";
import { Panel } from "primereact/panel";

export default function App() {
  const callback = () => window.close();
  return (
    <Panel>
      <div className="w-40 flex flex-col gap-4">
        <ViewPlansButton callback={callback} />
        <GotoBookmarkButton callback={callback} />
        <EditOptionsButton callback={callback} />
      </div>
    </Panel>
  );
}
