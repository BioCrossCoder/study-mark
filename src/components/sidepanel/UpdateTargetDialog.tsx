import {
  useCreateRelations,
  useRelationsOfTarget,
  useRemoveRelationsOfTarget,
} from "@/services/relation";
import { useTargetDetail, useUpdateTarget } from "@/services/target";
import { useTaskOptions } from "@/services/task";
import FormDialog from "../common/FormDialog";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { ExecStatus, statusIcon } from "@/common/enums";
import { RadioButton } from "primereact/radiobutton";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";

export default function UpdateTargetDialog(props: {
  close: () => void;
  id: string;
}) {
  const { id, close } = props;
  const target = useTargetDetail(id);
  const [name, setName] = useState(target.name);
  const [description, setDescription] = useState(target.description);
  const [status, setStatus] = useState(target.status);

  const relations = useRelationsOfTarget(target.id);
  const [tasks, setTasks] = useState(relations.map(({ taskId }) => taskId));
  const options = useTaskOptions();

  const toast = useRef(null);
  const updateTarget = useUpdateTarget(toast);
  const removeRelations = useRemoveRelationsOfTarget();
  const createRelations = useCreateRelations();
  async function handleSubmit() {
    const result = await updateTarget(id, { name, description, status });
    if (Error.isError(result)) {
      return result;
    }
    await removeRelations(id);
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
            name: "Status",
            item: (
              <div className="flex items-center gap-4">
                {Object.keys(statusIcon).map((item) => (
                  <div className="flex items-center gap-1">
                    <RadioButton
                      value={Number(item)}
                      checked={status === Number(item)}
                      onChange={(event) => setStatus(event.target.value)}
                    />
                    <label className="flex items-center gap-1">
                      <p className="text-xs">{ExecStatus[Number(item)]}</p>
                      <i className={statusIcon[Number(item) as ExecStatus]} />
                    </label>
                  </div>
                ))}
              </div>
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
