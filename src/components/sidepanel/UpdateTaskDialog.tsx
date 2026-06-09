import { Toast } from "primereact/toast";
import FormDialog from "../common/FormDialog";
import { useTaskDetail, useUpdateTask } from "@/services/task";
import { InputText } from "primereact/inputtext";
import { useRelationsOfTask } from "@/services/relation";
import { useTargetOptions } from "@/services/target";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { useId } from "react";
import {
  createRelations,
  removeRelationsOfTask,
} from "@/services/storage/relation";

export default function UpdateTaskDialog(props: {
  close: () => void;
  id: string;
}) {
  const { id, close } = props;
  const task = useTaskDetail(id);
  const [name, setName] = useState(task.name);
  const nameId = useId();
  const [description, setDescription] = useState(task.description);
  const descriptionId = useId();

  const relations = useRelationsOfTask(task.id);
  const [targets, setTargets] = useState(
    relations.map(({ targetId }) => targetId),
  );
  const targetsId = useId();
  const options = useTargetOptions();

  const toast = useRef(null);
  const updateTask = useUpdateTask(toast);
  async function handleSubmit() {
    const result = await updateTask(id, { name, description });
    if (Error.isError(result)) {
      return result;
    }
    await removeRelationsOfTask(id);
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
            id: nameId,
            name: "Name",
            item: (
              <InputText
                id={nameId}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
                className="flex-auto h-10 text-base!"
                autoFocus
              />
            ),
          },
          {
            id: descriptionId,
            name: "Description",
            item: (
              <InputTextarea
                id={descriptionId}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                autoComplete="off"
                rows={3}
                className="flex-auto text-base!"
              />
            ),
          },
          {
            id: targetsId,
            name: "Targets",
            item: (
              <MultiSelect
                inputId={targetsId}
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
