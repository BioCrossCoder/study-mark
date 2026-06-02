import { useLibraryDetail, useUpdateLibrary } from "@/services/library";
import FormDialog from "../common/FormDialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { useGetWebsiteMetadata } from "@/hooks/useGetWebsiteMetadata";

export default function UpdateLibraryDialog(props: {
  close: () => void;
  id: string;
}) {
  const { id, close } = props;
  const library = useLibraryDetail(id);
  const [name, setName] = useState(library.name);
  const [description, setDescription] = useState(library.description);
  const [source, setSource] = useState(library.source);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
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
    return await updateLibrary(id, { name, description, source });
  }

  return (
    <>
      <FormDialog
        header="Update Library"
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
            name: "Description",
            item: (
              <InputTextarea
                id="description"
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
      <Toast ref={toast} position="top-center" />
    </>
  );
}
