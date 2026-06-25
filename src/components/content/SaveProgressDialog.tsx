import { useTaskById, useTasksByPositionUrl } from "@/services/task";
import { fromRange } from "xpath-range";
import { updateTaskProgress } from "@/services/storage/task";
import { createBookmark } from "@/entrypoints/content/logics/bookmark";
import TaskDropdown from "./TaskDropdown";
import { useToast } from "@/hooks/content/useToast";
import SingleButtonDialog from "./SingleButtonDialog";

export default function SaveProgressDialog(props: {
  close: () => void;
  range: Range;
}) {
  const defaultTasks = useTasksByPositionUrl(window.location.href);
  const [option, setOption] = useState<string | undefined>(undefined);
  useEffect(() => {
    const defaultTask = defaultTasks.at(0);
    if (!option && defaultTask) {
      setOption(defaultTask.id);
    }
  }, [defaultTasks]);
  const task = useTaskById(option ?? "");
  const tasks = useTasksByPositionUrl(task?.position.url ?? "");
  const toast = useToast();
  async function handleSubmit() {
    // [CheckOption]
    if (tasks.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: "Save Progress Failed",
        detail: "No Task Selected",
      });
      return;
    } // [/]
    // [InsertNewBookmark]
    const bookmark = createBookmark(`study-mark-${crypto.randomUUID()}`);
    props.range.insertNode(bookmark); // [/]
    // [SaveBookmarkPosition]
    const { start, startOffset } = fromRange(props.range);
    const taskIds = tasks.map((task) => task.id);
    await updateTaskProgress(taskIds, window.location.href, {
      id: bookmark.id,
      xpath: start,
      offset: startOffset,
    }); // [/]
    // [RemoveOldBookmark]
    const id = tasks.at(0)?.position.bookmark?.id;
    if (id !== undefined) {
      document.getElementById(id)?.remove();
    } // [/]
    toast.current?.show({
      severity: "success",
      summary: "Save Progress Succeeded",
    });
    props.close();
  }

  return (
    <SingleButtonDialog
      close={props.close}
      title="Save Progress"
      onSubmit={handleSubmit}
    >
      <TaskDropdown
        value={option}
        onChange={(event) => setOption(event.value ?? "")}
      />
    </SingleButtonDialog>
  );
}
