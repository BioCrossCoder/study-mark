import { useChatHistoryQuery } from "@/services/chatHistory";
import ChatEmptyPlaceholder from "./ChatEmptyPlaceholder";
import { ScrollPanel } from "primereact/scrollpanel";
import ChatInputBox from "./ChatInputBox";
import { chatHistoryData, clearHistory } from "@/services/storage/chatHistory";
import ChatBubble from "./ChatBubble";
import { Toolbar } from "primereact/toolbar";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";

export default function ChatWindow() {
  const { data, dataUpdatedAt, refetch } = useChatHistoryQuery();
  const isHistoryEmpty = useMemo(
    () => (data ?? []).length === 0,
    [dataUpdatedAt],
  );
  useEffect(() => {
    return chatHistoryData.watch(() => {
      refetch();
    });
  });

  function handleClear() {
    confirmDialog({
      message: "Clear Chat History?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      accept: clearHistory,
    });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Toolbar
        className="border-0! rounded-none! border-b! "
        end={
          <>
            <i
              className="pi pi-trash hover:cursor-pointer hover:text-red-300"
              onClick={handleClear}
            />
            <ConfirmDialog />
          </>
        }
      />
      {isHistoryEmpty ? (
        <ChatEmptyPlaceholder />
      ) : (
        <ScrollPanel
          style={{ width: "100%", height: "100%" }}
          className="overflow-hidden"
        >
          {(data ?? []).map((item, i) => (
            <ChatBubble message={item} key={i} />
          ))}
        </ScrollPanel>
      )}
      <ChatInputBox />
    </div>
  );
}
