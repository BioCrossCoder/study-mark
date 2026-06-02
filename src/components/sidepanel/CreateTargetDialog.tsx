import { Toast } from "primereact/toast";
import FormDialog from "../common/FormDialog";
import { useTaskOptions } from "@/services/task";
import { useCreateTarget } from "@/services/target";
import { useCreateRelations } from "@/services/relation";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";

export default function CreateTargetDialog(props: { close: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState(new Array<string>());
  const options = useTaskOptions();
  const toast = useRef(null);
  const createTarget = useCreateTarget(toast);
  const createRelations = useCreateRelations();
  async function handleSubmit() {
    const result = await createTarget({ name, description });
    if (Error.isError(result)) {
      return result;
    }
    return await createRelations(
      tasks.map((taskId) => ({
        targetId: result,
        taskId,
      })),
    );
  }
  return (
    <>
      <FormDialog
        header="Create Target"
        onHide={props.close}
        fields={[
          {
            name: "Name",
            item: (
              <InputText
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
                className="flex-auto h-10 text-base!"
                autoFocus
              />
            ),
          },
          {
            name: "Description",
            item: (
              <InputTextarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                autoComplete="off"
                rows={3}
                className="flex-auto text-base!"
              />
            ),
          },
          {
            name: "Tasks",
            item: (
              <MultiSelect
                inputId="tasks"
                value={tasks}
                onChange={(event) => setTasks(event.target.value)}
                options={options}
                optionLabel="name"
                optionValue="code"
                display="chip"
                filter={true}
                placeholder="Select Tasks"
                maxSelectedLabels={3}
                className="flex-auto h-10 text-base! items-center"
              />
            ),
          },
        ]}
        onSubmit={handleSubmit}
      />
      <Toast ref={toast} position="top-center" />
    </>
  );
}
