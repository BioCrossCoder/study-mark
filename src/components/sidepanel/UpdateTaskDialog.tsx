import { Toast } from "primereact/toast";
import FormDialog from "../common/FormDialog";
import { useTaskDetail, useUpdateTask } from "@/services/task";
import { InputText } from "primereact/inputtext";
import {
  useCreateRelations,
  useRelationsOfTask,
  useRemoveRelationsOfTask,
} from "@/services/relation";
import { useTargetOptions } from "@/services/target";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";

export default function UpdateTaskDialog(props: {
  close: () => void;
  id: string;
}) {
  const { id, close } = props;
  const task = useTaskDetail(id);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);

  const relations = useRelationsOfTask(task.id);
  const [targets, setTargets] = useState(
    relations.map(({ targetId }) => targetId),
  );
  const options = useTargetOptions();

  const toast = useRef(null);
  const updateTask = useUpdateTask(toast);
  const removeRelations = useRemoveRelationsOfTask();
  const createRelations = useCreateRelations();
  async function handleSubmit() {
    const result = await updateTask(id, { name, description });
    if (Error.isError(result)) {
      return result;
    }
    await removeRelations(id);
    return await createRelations(
      targets.map((targetId) => ({
        targetId,
        taskId: result,
      })),
    );
  }

  return (
    <>
      <FormDialog
        header="Update Task"
        onHide={close}
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
            name: "Targets",
            item: (
              <MultiSelect
                inputId="targets"
                value={targets}
                onChange={(event) => setTargets(event.target.value)}
                options={options}
                optionLabel="name"
                optionValue="code"
                display="chip"
                filter={true}
                placeholder="Select Targets"
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
