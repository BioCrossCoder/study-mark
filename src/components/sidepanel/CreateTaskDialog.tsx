import { InputTextarea } from "primereact/inputtextarea";
import FormDialog from "../common/FormDialog";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { useTargetOptions } from "@/services/target";
import { useCreateTask } from "@/services/task";
import { Toast } from "primereact/toast";
import { getCurrentTab } from "@/common/utils";
import { useId } from "react";
import { createRelations } from "@/services/storage/relation";

export default function CreateTaskDialog(props: { close: () => void }) {
  const [name, setName] = useState("");
  const nameId = useId();
  const [description, setDescription] = useState("");
  const descriptionId = useId();
  const [source, setSource] = useState("");
  const sourceId = useId();
  const [targets, setTargets] = useState(new Array<string>());
  const targetsId = useId();
  const options = useTargetOptions();
  async function handleSetSource() {
    const tab = await getCurrentTab();
    setSource(tab?.url ?? source);
    setName(tab?.title ?? name);
  }

  const toast = useRef(null);
  const createTask = useCreateTask(toast);
  async function handleSubmit() {
    const result = await createTask({ name, description, source });
    if (Error.isError(result)) {
      return result;
    }
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
        header="Create Task"
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
            id: sourceId,
            name: "Source",
            label: (
              <div className="flex items-center">
                <p>Source</p>
                <i
                  className="pi pi-bookmark hover:cursor-pointer hover:text-(--primary-color) mx-2"
                  onClick={handleSetSource}
                />
              </div>
            ),
            item: (
              <InputText
                id={sourceId}
                value={source}
                onChange={(event) => setSource(event.target.value)}
                autoComplete="off"
                className="flex-auto h-10 text-base!"
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
      <Toast ref={toast} position="top-center" />
    </>
  );
}
