import { useChatHistoryQuery } from "@/services/chatHistory";
import ChatEmptyPlaceholder from "./ChatEmptyPlaceholder";
import { ScrollPanel } from "primereact/scrollpanel";
import ChatInputBox from "./ChatInputBox";
import { chatHistoryData, clearHistory } from "@/services/storage/chatHistory";
import ChatBubble from "./ChatBubble";
import { Toolbar } from "primereact/toolbar";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { ScrollTop } from "primereact/scrolltop";

export default function ChatWindow() {
  const { data, dataUpdatedAt, refetch } = useChatHistoryQuery();
  const history = useMemo(() => data ?? [], [dataUpdatedAt]);
  const bottomAnchor = useRef(document.createElement("div"));
  useEffect(
    () =>
      chatHistoryData.watch(async () => {
        await refetch();
        bottomAnchor.current.scrollIntoView({
          behavior: history.at(-1)?.type === "human" ? "instant" : "smooth",
          block: "end",
        });
      }),
    [bottomAnchor, dataUpdatedAt],
  );

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
      {history.length === 0 ? (
        <ChatEmptyPlaceholder />
      ) : (
        <ScrollPanel
          style={{ width: "100%", height: "100%" }}
          className="overflow-hidden"
        >
          {history.map((item, i) => (
            <ChatBubble
              message={item}
              key={i}
              isLast={i === history.length - 1}
            />
          ))}
          <div ref={bottomAnchor} />
          <ScrollTop target="parent" threshold={0} />
        </ScrollPanel>
      )}
      <ChatInputBox />
    </div>
  );
}
