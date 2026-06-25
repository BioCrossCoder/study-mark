import { CustomEventName, MessageID } from "@/common/enums";
import { onMessage } from "webext-bridge/content-script";
import SaveProgressDialog from "@/components/content/SaveProgressDialog";
import AddCommentDialog from "@/components/content/AddCommentDialog";
import EditCommentDialog from "@/components/content/EditCommentDialog";

export default function App() {
  const [spdVisible, setSpdVisible] = useState(false);
  const [acdVisible, setAcdVisible] = useState(false);
  const [ecdVisible, setEcdVisible] = useState(false);
  const [id, setId] = useState("");
  const [range, setRange] = useState(new Range());
  useEffect(() => {
    onMessage(MessageID.SaveProgress, () => {
      setRange(window.getSelection()!.getRangeAt(0));
      setSpdVisible(true);
    });
    onMessage(MessageID.AddComment, () => {
      setRange(window.getSelection()!.getRangeAt(0));
      setAcdVisible(true);
    });
    document.addEventListener(CustomEventName.UpdateComment, (event) => {
      if (event instanceof CustomEvent) {
        setId(event.detail);
        setEcdVisible(true);
      }
    });
  }, []);
  return (
    (spdVisible || acdVisible || ecdVisible) && (
      <div className="fixed left-0 top-0 w-screen h-screen z-50">
        {spdVisible && (
          <SaveProgressDialog
            close={() => setSpdVisible(false)}
            range={range}
          />
        )}
        {acdVisible && (
          <AddCommentDialog close={() => setAcdVisible(false)} range={range} />
        )}
        {ecdVisible && (
          <EditCommentDialog close={() => setEcdVisible(false)} id={id} />
        )}
      </div>
    )
  );
}
