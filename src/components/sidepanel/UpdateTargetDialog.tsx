import { useRelationsOfTarget } from "@/services/relation";
import { useTargetDetail, useUpdateTarget } from "@/services/target";
import { useTaskOptions } from "@/services/task";
import FormDialog from "../common/FormDialog";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { useId } from "react";
import {
  createRelations,
  removeRelationsOfTarget,
} from "@/services/storage/relation";

export default function UpdateTargetDialog(props: {
  close: () => void;
  id: string;
}) {
  const { id, close } = props;
  const target = useTargetDetail(id);
  const [name, setName] = useState(target.name);
  const nameId = useId();
  const [description, setDescription] = useState(target.description);
  const descriptionId = useId();

  const relations = useRelationsOfTarget(target.id);
  const [tasks, setTasks] = useState(relations.map(({ taskId }) => taskId));
  const tasksId = useId();
  const options = useTaskOptions();

  const toast = useRef(null);
  const updateTarget = useUpdateTarget(toast);
  async function handleSubmit() {
    const result = await updateTarget(id, { name, description });
    if (Error.isError(result)) {
      return result;
    }
    await removeRelationsOfTarget(id);
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
        header="Update Target"
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
            id: tasksId,
            name: "Tasks",
            item: (
              <MultiSelect
                inputId={tasksId}
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
