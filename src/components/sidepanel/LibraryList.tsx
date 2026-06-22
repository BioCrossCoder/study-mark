import { Library } from "@/common/types";
import { sortBy } from "@/common/utils";
import { useLibraryData } from "@/services/library";
import { Card } from "primereact/card";
import { confirmPopup } from "primereact/confirmpopup";
import { DataView } from "primereact/dataview";
import UpdateLibraryDialog from "./UpdateLibraryDialog";
import { removeLibrary } from "@/services/storage/library";
import { useUiStateData } from "@/services/uiState";
import { DialogType, ListStyle } from "@/common/enums";
import { Chip } from "primereact/chip";
import { useDialogVisible } from "@/hooks/useDialogVisible";

export default function LibraryList() {
  const data = useLibraryData();
  const list = useMemo(
    () => (data ? Object.values(data).toSorted(sortBy("createdAt", true)) : []),
    [data],
  );
  return <DataView value={list} itemTemplate={DataItem} rows={list.length} />;
}

function DataItem(data: Library) {
  const { listStyle } = useUiStateData();
  const { id, name, description, source: url } = data;
  const [visible, setVisible] = useDialogVisible(DialogType.UpdateLibrary, id);

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
  switch (listStyle) {
    case ListStyle.Card:
      return (
        <Card
          className="bg-(--highlight-bg)! mb-3"
          title={
            <div className="flex justify-between items-center">
              <p className="text-lg break-all">{name}</p>
              <div className="flex justify-between items-center gap-4">
                <i
                  className="pi pi-external-link hover:cursor-pointer hover:text-(--primary-color)"
                  onClick={() => browser.tabs.create({ url })}
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
              </div>
            </div>
          }
        >
          <p className="text-xs">{description}</p>
        </Card>
      );
    case ListStyle.Line:
      return (
        <div className="flex my-1">
          <Chip
            label={name}
            className="break-all hover:cursor-pointer hover:text-(--primary-color)!"
            onClick={() => browser.tabs.create({ url })}
          />
        </div>
      );
    default:
      return <></>;
  }
}
