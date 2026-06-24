import { MessageID } from "@/common/enums";
import { onMessage } from "webext-bridge/content-script";
import SaveProgressDialog from "@/components/content/SaveProgressDialog";
import EditCommentDialog from "@/components/content/EditCommentDialog";

export default function App() {
  const [spdVisible, setSpdVisible] = useState(false);
  const [acdVisible, setAcdVisible] = useState(false);
  useEffect(() => {
    onMessage(MessageID.SaveProgress, () => setSpdVisible(true));
    onMessage(MessageID.AddComment, () => setAcdVisible(true));
  }, []);
  return (
    (spdVisible || acdVisible) && (
      <div className="fixed left-0 top-0 w-screen h-screen z-50">
        {spdVisible && (
          <SaveProgressDialog close={() => setSpdVisible(false)} />
        )}
        {acdVisible && <EditCommentDialog close={() => setAcdVisible(false)} />}
      </div>
    )
  );
}
