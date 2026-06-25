import { useToast } from "@/hooks/content/useToast";
import { removeComment, updateComment } from "@/services/storage/comment";
import { Instance, Props } from "tippy.js";
import SingleButtonDialog from "./SingleButtonDialog";
import { InputTextarea } from "primereact/inputtextarea";

export default function EditCommentDialog(props: {
  close: () => void;
  id: string;
}) {
  const comment = document.getElementById(props.id)!;
  const tippyInst = (comment as any)._tippy as Instance<Props>;
  const [content, setContent] = useState(tippyInst.popper.textContent);
  const toast = useToast();
  async function handleSubmit() {
    if (content) {
      tippyInst.setContent(content);
      await updateComment(comment.id, content);
      toast.current?.show({
        severity: "success",
        summary: "Update Comment Succeeded",
      });
    } else {
      tippyInst.destroy();
      comment.remove();
      await removeComment(comment.id);
      toast.current?.show({
        severity: "success",
        summary: "Remove Comment Succeeded",
      });
    }
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
