import { useUpdateLibrary } from "@/services/library";
import FormDialog from "../common/FormDialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useGetWebsiteMetadata } from "@/hooks/sidepanel/useGetWebsiteMetadata";
import { useId } from "react";
import { Library } from "@/common/types";
import { useToast } from "@/hooks/common/useToast";

export default function UpdateLibraryDialog(props: {
  close: () => void;
  data: Library;
}) {
  const { data, close } = props;
  const [name, setName] = useState(data.name);
  const nameId = useId();
  const [description, setDescription] = useState(data.description);
  const descriptionId = useId();
  const [source, setSource] = useState(data.source);
  const sourceId = useId();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const getWebsiteMetadata = useGetWebsiteMetadata(toast);
  async function handleSetSource() {
    setLoading(true);
    const result = await getWebsiteMetadata(source);
    setLoading(false);
    if (Error.isError(result)) {
      return;
    }
    setDescription(result.description ?? description);
  }

  const updateLibrary = useUpdateLibrary(toast);
  async function handleSubmit() {
    return await updateLibrary(data.id, { name, description, source });
  }

  return (
    <FormDialog
      header="Update Library"
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
      ]}
      onSubmit={handleSubmit}
    />
  );
}
