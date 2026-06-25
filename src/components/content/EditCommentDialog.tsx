import { InputTextarea } from "primereact/inputtextarea";
import SingleButtonDialog from "./SingleButtonDialog";
import { useToast } from "@/hooks/content/useToast";
import { fromRange } from "xpath-range";
import { tryInsertCommentBlock } from "@/entrypoints/content/logics/comment";
import { insertComment } from "@/services/storage/comment";

export default function EditCommentDialog(props: {
  close: () => void;
  range: Range;
}) {
  const [content, setContent] = useState("");
  const toast = useToast();

  async function handleSubmit() {
    const summary = "Edit Comment Failed";
    // [AvoidCommentBlockCrossElement]
    const range = fromRange(props.range);
    if (range.start !== range.end) {
      toast.current?.show({
        severity: "error",
        summary,
        detail: "Comment blocks cannot cross paragraph",
      });
      return;
    } // [/]
    if (!content) {
      // TODO 删除当前批注
      return;
    }
    // [InsertCommentBlock]
    const result = tryInsertCommentBlock(
      `study-mark-${crypto.randomUUID()}-${Date.now()}`,
      props.range,
      content,
    );
    if (Error.isError(result)) {
      toast.current?.show({
        severity: "error",
        summary,
        detail: result.message,
      });
      return;
    } // [/]
    // [SaveCommentBlockData]
    await insertComment({
      id: result.id,
      url: window.location.href,
      content,
      range,
    }); // [/]
    toast.current?.show({
      severity: "success",
      summary: "Edit Comment Succeeded",
    });
    props.close();
  }
  return (
    <SingleButtonDialog
      close={props.close}
      title="Edit Comment"
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
