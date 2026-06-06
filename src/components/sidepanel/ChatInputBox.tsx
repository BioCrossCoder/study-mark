import { AgentMode, Signal } from "@/common/enums";
import { ChatMessage } from "@/common/types";
import { useChatLoadingQuery } from "@/services/chatLoading";
import { Sender } from "@ant-design/x";

export default function ChatInputBox() {
  const [question, setQuestion] = useState("");
  const { data: loading } = useChatLoadingQuery();
  function handleSubmit() {
    const message: ChatMessage = {
      mode: AgentMode.Plan,
      message: question,
    };
    browser.runtime.sendMessage(message);
    handleClear();
  }

  function handleCancel() {
    browser.runtime.sendMessage(Signal.Stop);
  }

  function handleClear() {
    setQuestion("");
  }

  return (
    <div className="p-2">
      <Sender
        placeholder="Input your demand to ask AI for a Study Plan"
        value={question}
        onChange={setQuestion}
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
        suffix={false}
      />
    </div>
  );
}
