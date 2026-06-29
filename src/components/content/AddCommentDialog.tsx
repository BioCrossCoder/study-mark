import { InputTextarea } from "primereact/inputtextarea";
import SingleButtonDialog from "./SingleButtonDialog";
import { useToast } from "@/hooks/content/useToast";
import { insertCommentBlock } from "@/entrypoints/content/logics/comment";

export default function AddCommentDialog(props: {
  close: () => void;
  range: Range;
}) {
  const [content, setContent] = useState("");
  const toast = useToast();
  async function handleSubmit() {
    if (!content.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Empty Comment",
      });
      props.close();
      return;
    }
    await insertCommentBlock(
      `study-mark-${crypto.randomUUID()}-${Date.now()}`,
      props.range,
      content,
    );
    toast.current?.show({
      severity: "success",
      summary: "Add Comment Succeeded",
    });
    props.close();
  }
  return (
    <SingleButtonDialog
      close={props.close}
      title="Add Comment"
      onSubmit={handleSubmit}
    >
      <InputTextarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={5}
        cols={30}
        className="text-[16px]!"
      />
    </SingleButtonDialog>
  );
}
