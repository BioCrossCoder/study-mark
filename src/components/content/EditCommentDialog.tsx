import { useToast } from "@/hooks/content/useToast";
import SingleButtonDialog from "./SingleButtonDialog";
import { InputTextarea } from "primereact/inputtextarea";
import { commentStore } from "@/entrypoints/content/logics/comment";
import { useUpdateFormStore } from "@/stores/content/updateForm";

export default function EditCommentDialog() {
  const { visible, id, close } = useUpdateFormStore();
  const [content, setContent] = useState(commentStore.get(id)?.content);
  const toast = useToast();
  async function handleSubmit() {
    if (content?.trim()) {
      await commentStore.update(id, content);
      toast.current?.show({
        severity: "success",
        summary: "Update Comment Succeeded",
      });
    } else {
      await commentStore.remove(id);
      toast.current?.show({
        severity: "success",
        summary: "Remove Comment Succeeded",
      });
    }
    close();
  }
  return (
    visible && (
      <SingleButtonDialog
        close={close}
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
    )
  );
}
