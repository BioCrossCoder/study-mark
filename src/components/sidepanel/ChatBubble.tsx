import { AIMessage, HumanMessage } from "langchain";
import { Bubble } from "@ant-design/x";
import { Avatar } from "primereact/avatar";

export default function ChatBubble(props: {
  message: AIMessage | HumanMessage;
}) {
  const { message } = props;
  const senders = {
    ai: "pi pi-microchip-ai",
    human: "pi pi-user",
  };
  const placements = {
    ai: "end",
    human: "start",
  } as const;
  return (
    <Bubble
      content={message.content}
      typing={{ effect: "typing" }}
      header={message.type}
      avatar={<Avatar icon={senders[message.type]} />}
      placement={placements[message.type]}
      classNames={{
        root: "m-4",
        header: "text-(--highlight-text-color)!",
        content: "bg-(--primary-color)! text-(--primary-color-text)!",
      }}
    />
  );
}
