import { useChatHistoryQuery } from "@/services/chatHistory";
import ChatEmptyPlaceholder from "./ChatEmptyPlaceholder";
import { ScrollPanel } from "primereact/scrollpanel";
import ChatInputBox from "./ChatInputBox";
import { chatHistoryData } from "@/services/storage/chatHistory";

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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isHistoryEmpty ? (
        <ChatEmptyPlaceholder />
      ) : (
        <ScrollPanel
          style={{ width: "100%", height: "100%" }}
          className="overflow-hidden"
        >
          {(data ?? []).map((item) => JSON.stringify(item)).join("\n\n")}
        </ScrollPanel>
      )}
      <ChatInputBox />
    </div>
  );
}
