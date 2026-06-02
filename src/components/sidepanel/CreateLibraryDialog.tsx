import { useCreateLibrary } from "@/services/library";
import FormDialog from "../common/FormDialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { useGetWebsiteMetadata } from "@/hooks/useGetWebsiteMetadata";

export default function CreateLibraryDialog(props: { close: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const getWebsiteMetadata = useGetWebsiteMetadata(toast);
  async function handleSetSource() {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    ).at(0);
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
                disabled={loading}
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
        ]}
        onSubmit={handleSubmit}
      />
      <Toast ref={toast} position="top-center" />
    </>
  );
}
