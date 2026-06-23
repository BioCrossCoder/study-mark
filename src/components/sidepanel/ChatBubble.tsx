import { Bubble, Sources, Think } from "@ant-design/x";
import { Avatar } from "primereact/avatar";
import { ChatAIMessage, ChatHistoryMessage, Plan } from "@/common/types";
import { XMarkdown } from "@ant-design/x-markdown";
import { Chip } from "primereact/chip";
import { tryFormatAsJson } from "@/common/utils";
import { AgentMode, DialogType } from "@/common/enums";
import { Button } from "primereact/button";
import CreatePlanDialog from "./CreatePlanDialog";
import { useChatLoadingData } from "@/services/chatLoading";
import { useDialogVisible } from "@/services/uiState";
import { closeDialog, openDialog } from "@/services/storage/uiState";
import { extractPlanOutline } from "@/common/logics";

export default function ChatBubble(props: {
  message: ChatHistoryMessage;
  isLast: boolean;
  order: number;
}) {
  const { message, order } = props;
  const header = message.type === "human" ? "User" : "Agent";
  const sender = message.type === "human" ? "pi pi-user" : "pi pi-microchip-ai";
  const placement = message.type === "human" ? "start" : "end";
  const loading = useChatLoadingData();
  const canCreatePlan =
    message.type === "ai" &&
    message.mode === AgentMode.Plan &&
    (!props.isLast || loading === false);
  const visible = useDialogVisible(DialogType.CreatePlan, order.toString());
  function handleOpen() {
    openDialog(
      DialogType.CreatePlan,
      order.toString(),
      extractPlanOutline(message as ChatAIMessage) ?? ({} as Plan),
    );
  }

  return (
    <Bubble
      content={
        message.type === "human" ? (
          message.content
        ) : (
          <div className="flex flex-col gap-1">
            {message.content.map((item, i) => {
              switch (item.type) {
                case "text":
                  return (
                    <XMarkdown
                      content={item.content}
                      className="text-(--primary-color-text)!"
                      key={i}
                    />
                  );
                case "think":
                  return (
                    <Think
                      title="Thinking"
                      icon={<i className="pi pi-lightbulb" />}
                      defaultExpanded={item.loading}
                      loading={item.loading}
                      key={`${i}_${item.loading}`}
                      classNames={{
                        status: "text-(--primary-color-text)!",
                      }}
                    >
                      <p className="text-(--primary-color-text)!">
                        {item.content}
                      </p>
                    </Think>
                  );
                case "tool":
                  return (
                    <Sources
                      title={
                        <div className="flex items-center gap-2">
                          <i
                            className={
                              item.loading
                                ? "pi pi-spinner pi-spin"
                                : "pi pi-wrench"
                            }
                          />
                          <Chip label={item.name} className="h-5 text-xs!" />
                        </div>
                      }
                      expandIconPosition="end"
                      defaultExpanded={false}
                      key={i}
                      classNames={{
                        title: "text-(--primary-color-text)!",
                        content: "bg-(--text-color-secondary) rounded-lg p-3",
                      }}
                    >
                      <XMarkdown
                        content={`**Params**\n\`\`\`json\n${tryFormatAsJson(item.params)}\n\`\`\`\n**Result**\n\`\`\`json\n${tryFormatAsJson(item.result)}\n\`\`\``}
                        className="text-(--primary-color-text)!"
                      />
                    </Sources>
                  );
              }
            })}
            {canCreatePlan && (
              <>
                <Button label="Create Plan" onClick={handleOpen} />
                {visible && (
                  <CreatePlanDialog close={closeDialog} message={message} />
                )}
              </>
            )}
          </div>
        )
      }
      typing={{ effect: "fade-in" }}
      header={header}
      avatar={<Avatar icon={sender} />}
      placement={placement}
      classNames={{
        root: "m-4",
        header: "text-(--text-color)! font-semibold",
        content: "bg-(--primary-color)! text-(--primary-color-text)!",
      }}
    />
  );
}
