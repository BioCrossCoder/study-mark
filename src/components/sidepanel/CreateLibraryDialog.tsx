import { useCreateLibrary } from "@/services/library";
import FormDialog from "../common/FormDialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useGetWebsiteMetadata } from "@/hooks/useGetWebsiteMetadata";
import { getCurrentTab } from "@/common/utils";
import { useId } from "react";
import { useToast } from "@/hooks/useToast";

export default function CreateLibraryDialog(props: { close: () => void }) {
  const [name, setName] = useState("");
  const nameId = useId();
  const [description, setDescription] = useState("");
  const descriptionId = useId();
  const [source, setSource] = useState("");
  const sourceId = useId();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const getWebsiteMetadata = useGetWebsiteMetadata(toast);
  async function handleSetSource() {
    const tab = await getCurrentTab();
    setName(tab?.title ?? name);
    const newSource = tab?.url ?? source;
    if (!newSource) {
      return;
    }
    setSource(newSource);
    setLoading(true);
    const result = await getWebsiteMetadata(newSource);
    setLoading(false);
    if (Error.isError(result)) {
      return;
    }
    setDescription(result.description ?? description);
  }

  const createLibrary = useCreateLibrary(toast);
  async function handleSubmit() {
    return await createLibrary({ name, description, source });
  }
  return (
    <>
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
    </>
  );
}
