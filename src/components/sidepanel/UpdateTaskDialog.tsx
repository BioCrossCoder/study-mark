import FormDialog from "../common/FormDialog";
import { useUpdateTask } from "@/services/task";
import { InputText } from "primereact/inputtext";
import { useTargetOptions } from "@/services/target";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { useId } from "react";
import {
  createRelations,
  removeRelationsOfTask,
} from "@/services/storage/relation";
import { Task } from "@/common/types";
import { useToast } from "@/hooks/common/useToast";

export default function UpdateTaskDialog(props: {
  close: () => void;
  data: Task;
  relatedItemIds: string[];
}) {
  const { close, data, relatedItemIds } = props;
  const [name, setName] = useState(data.name);
  const nameId = useId();
  const [description, setDescription] = useState(data.description);
  const descriptionId = useId();

  const [targets, setTargets] = useState(relatedItemIds);
  const targetsId = useId();
  const options = useTargetOptions();

  const toast = useToast();
  const updateTask = useUpdateTask(toast);
  async function handleSubmit() {
    const result = await updateTask(data.id, { name, description });
    if (Error.isError(result)) {
      return result;
    }
    await removeRelationsOfTask(data.id);
    return await createRelations(
      targets.map((targetId) => ({
        targetId,
        taskId: result,
      })),
    );
  }

  return (
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
  );
}
