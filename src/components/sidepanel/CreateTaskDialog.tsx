import { InputTextarea } from "primereact/inputtextarea";
import FormDialog from "../common/FormDialog";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { useTargetOptions, useTargetQuery } from "@/services/target";
import { useCreateTask } from "@/services/task";
import { Toast } from "primereact/toast";
import { useCreateRelations } from "@/services/relation";

export default function CreateTaskDialog(props: { close: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [targets, setTargets] = useState(new Array<string>());
  const options = useTargetOptions();
  async function handleSetSource() {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    ).at(0);
    setSource(tab?.url ?? source);
    setName(tab?.title ?? name);
  }

  const toast = useRef(null);
  const createTask = useCreateTask(toast);
  const createRelations = useCreateRelations();
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
                id="source"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                autoComplete="off"
                className="flex-auto h-10 text-base!"
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
