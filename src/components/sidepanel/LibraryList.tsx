import { Library } from "@/common/types";
import { sortBy } from "@/common/utils";
import { useLibraryData } from "@/services/library";
import { Card } from "primereact/card";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { DataView } from "primereact/dataview";
import UpdateLibraryDialog from "./UpdateLibraryDialog";
import { removeLibrary } from "@/services/storage/library";

export default function LibraryList() {
  const data = useLibraryData();
  const list = useMemo(
    () => (data ? Object.values(data).toSorted(sortBy("createdAt")) : []),
    [data],
  );
  return <DataView value={list} itemTemplate={DataItem} rows={list.length} />;
}

function DataItem(data: Library) {
  const { id, name, description, source } = data;
  const [visible, setVisible] = useState(false);

  function handleRemove(event: React.MouseEvent<HTMLElement>) {
    confirmPopup({
      target: event.currentTarget,
      message: "Remove this Library?",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: async () => removeLibrary(id),
    });
  }

  return (
    <Card
      className="bg-(--highlight-bg)! mb-3"
      title={
        <div className="flex justify-between items-center">
          <p className="text-lg">{name}</p>
          <div className="flex justify-between items-center gap-4">
            <i
              className="pi pi-external-link hover:cursor-pointer hover:text-(--primary-color)"
              onClick={() => browser.tabs.create({ url: source })}
            />
            <i
              className="pi pi-pen-to-square hover:cursor-pointer hover:text-(--primary-color)"
              onClick={() => setVisible(true)}
            />
            {visible && (
              <UpdateLibraryDialog
                close={() => setVisible(false)}
                data={data}
              />
            )}
            <i
              className="pi pi-trash hover:cursor-pointer hover:text-red-400"
              onClick={handleRemove}
            />
            <ConfirmPopup />
          </div>
        </div>
      }
    >
      <p className="text-xs">{description}</p>
    </Card>
  );
}
