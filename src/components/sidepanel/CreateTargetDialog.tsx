import FormDialog from "../common/FormDialog";
import { useTaskOptions } from "@/services/task";
import { useCreateTarget } from "@/services/target";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { useId } from "react";
import { createRelations } from "@/services/storage/relation";
import { useToast } from "@/hooks/useToast";

export default function CreateTargetDialog(props: { close: () => void }) {
  const [name, setName] = useState("");
  const nameId = useId();
  const [description, setDescription] = useState("");
  const descriptionId = useId();
  const [tasks, setTasks] = useState(new Array<string>());
  const tasksId = useId();
  const options = useTaskOptions();
  const toast = useToast();
  const createTarget = useCreateTarget(toast);
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
                pt={{
                  item: {
                    style: {
                      whiteSpace: "normal",
                      wordBreak: "break-all",
                    },
                  },
                }}
              />
            ),
          },
        ]}
        onSubmit={handleSubmit}
      />
    </>
  );
}
