import { useCommentUrls } from "@/services/comment";
import { Chip } from "primereact/chip";
import { DataView } from "primereact/dataview";

export default function CommentHistoryList() {
  const urls = useCommentUrls();
  return <DataView value={urls} itemTemplate={DataItem} rows={urls.length} />;
}

function DataItem(url: string) {
  return (
    <Chip
      label={url}
      className="break-all my-1 hover:cursor-pointer hover:text-(--primary-color)!"
      onClick={() => browser.tabs.create({ url })}
    />
  );
}
