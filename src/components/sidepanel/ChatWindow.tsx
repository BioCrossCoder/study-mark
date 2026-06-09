import ChatEmptyPlaceholder from "./ChatEmptyPlaceholder";
import { ScrollPanel } from "primereact/scrollpanel";
import ChatInputBox from "./ChatInputBox";
import { chatHistoryData, clearHistory } from "@/services/storage/chatHistory";
import ChatBubble from "./ChatBubble";
import { Toolbar } from "primereact/toolbar";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { ScrollTop } from "primereact/scrolltop";
import { useChatHistoryData } from "@/services/chatHistory";

export default function ChatWindow() {
  const history = useChatHistoryData();
  const bottomAnchor = useRef(document.createElement("div"));
  useEffect(
    () =>
      chatHistoryData.watch(async () => {
        bottomAnchor.current.scrollIntoView({
          behavior: history.at(-1)?.type === "human" ? "instant" : "smooth",
          block: "end",
        });
      }),
    [bottomAnchor],
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
          <ScrollTop target="parent" threshold={0} className="right-0!" />
        </ScrollPanel>
      )}
      <ChatInputBox />
    </div>
  );
}
