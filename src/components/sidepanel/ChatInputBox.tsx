import { AgentCommand, Signal } from "@/common/enums";
import { ChatMessage } from "@/common/types";
import { useChatLoadingData } from "@/services/chatLoading";
import { useUiStateData } from "@/services/uiState";
import { updateChatInputQuery } from "@/services/storage/uiState";
import { Sender } from "@ant-design/x";

export default function ChatInputBox() {
  const { chatInputQuery } = useUiStateData();
  const [question, setQuestion] = useState(chatInputQuery);
  useEffect(() => {
    setQuestion(chatInputQuery);
  }, [chatInputQuery]);

  function handleChange(value: string) {
    setQuestion(value);
    updateChatInputQuery(value);
  }

  const loading = useChatLoadingData();
  function handleSubmit() {
    const message: ChatMessage = {
      mode: AgentCommand.Plan,
      message: question,
    };
    browser.runtime.sendMessage(message);
    handleClear();
  }

  function handleCancel() {
    browser.runtime.sendMessage(Signal.Stop);
  }

  const isQuestionEmpty = useMemo(() => question.length === 0, [question]);
  function handleClear() {
    setQuestion("");
    updateChatInputQuery("");
  }

  return (
    <div className="p-2">
      <Sender
        placeholder="Input your demand to ask AI for a Study Plan"
        value={question}
        onChange={handleChange}
        loading={loading ?? true}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        autoSize={{ minRows: 2, maxRows: 2 }}
        classNames={{
          root: "border-(--primary-color)!",
          input:
            "text-(--text-color)! caret-(--text-color)! placeholder:text-(--highlight-text-color)!",
        }}
        footer={(_, { components }) => {
          const { SendButton, LoadingButton } = components;
          return (
            <div className="flex justify-between items-center">
              <div className="flex">
                <p>⇧↵ newline</p>
                <p className="mx-1 font-semibold">/</p>
                <p>↵ send</p>
              </div>
              {loading ? (
                <LoadingButton
                  className="bg-(--primary-color)!"
                  icon={
                    <i className="pi pi-spinner pi-spin bg-(--primary-color)! text-(--primary-color-text)!" />
                  }
                />
              ) : (
                <SendButton
                  className="bg-(--primary-color)! disabled:bg-(--highlight-bg)!"
                  icon={
                    <i className="pi pi-send text-(--primary-color-text)!" />
                  }
                />
              )}
            </div>
          );
        }}
        suffix={
          !isQuestionEmpty && (
            <i
              className="pi pi-times-circle hover:cursor-pointer hover:text-red-300"
              onClick={handleClear}
            />
          )
        }
      />
    </div>
  );
}
