import { MessageID } from "@/common/enums";
import { onMessage } from "webext-bridge/content-script";
import SaveProgressDialog from "@/components/content/SaveProgressDialog";
import AddCommentDialog from "@/components/content/AddCommentDialog";
import EditCommentDialog from "@/components/content/EditCommentDialog";
import CommentBanner from "@/components/content/CommentBanner";
import { useUpdateFormStore } from "@/stores/content/updateForm";

export default function App() {
  const [spdVisible, setSpdVisible] = useState(false);
  const [acdVisible, setAcdVisible] = useState(false);
  const { visible: ecdVisible } = useUpdateFormStore();
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
  }, []);
  return (
    <>
      {(spdVisible || acdVisible || ecdVisible) && (
        <div className="fixed left-0 top-0 w-screen h-screen z-50">
          {spdVisible && (
            <SaveProgressDialog
              close={() => setSpdVisible(false)}
              range={range}
            />
          )}
          {acdVisible && (
            <AddCommentDialog
              close={() => setAcdVisible(false)}
              range={range}
            />
          )}
          <EditCommentDialog />
        </div>
      )}
      <CommentBanner />
    </>
  );
}
