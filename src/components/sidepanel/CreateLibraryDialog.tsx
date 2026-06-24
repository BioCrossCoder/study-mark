import { useCreateLibrary } from "@/services/library";
import FormDialog from "../common/FormDialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useGetWebsiteMetadata } from "@/hooks/sidepanel/useGetWebsiteMetadata";
import { getCurrentTab } from "@/common/utils";
import { useId } from "react";
import { useToast } from "@/hooks/common/useToast";
import { useDialogFormField } from "@/hooks/sidepanel/useDialogFormField";
import { DialogType } from "@/common/enums";
import { updateDialogForm } from "@/services/storage/uiState";
import { useDialogForm } from "@/services/uiState";

export default function CreateLibraryDialog(props: { close: () => void }) {
  const [name, setName] = useDialogFormField(DialogType.CreateLibrary, "name");
  const nameId = useId();
  const [description, setDescription] = useDialogFormField(
    DialogType.CreateLibrary,
    "description",
  );
  const descriptionId = useId();
  const [source, setSource] = useDialogFormField(
    DialogType.CreateLibrary,
    "source",
  );
  const sourceId = useId();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const getWebsiteMetadata = useGetWebsiteMetadata(toast);
  const form = useDialogForm<DialogType.CreateLibrary>();
  async function handleSetSource() {
    const tab = await getCurrentTab();
    form.name = tab?.title ?? name;
    await updateDialogForm(form);
    const newSource = tab?.url ?? source;
    if (!newSource) {
      return;
    }
    form.source = newSource;
    await updateDialogForm(form);
    setLoading(true);
    const result = await getWebsiteMetadata(newSource);
    setLoading(false);
    if (Error.isError(result)) {
      return;
    }
    form.description = result.description ?? description;
    await updateDialogForm(form);
  }

  const createLibrary = useCreateLibrary(toast);
  async function handleSubmit() {
    return await createLibrary({ name, description, source });
  }
  return (
    <FormDialog
      header="Create Library"
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
              disabled={loading}
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
      ]}
      onSubmit={handleSubmit}
    />
  );
}
