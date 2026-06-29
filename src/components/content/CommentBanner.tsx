import { useHoverMessageStore } from "@/stores/content/hoverMessage";
import { Panel } from "primereact/panel";

export default function CommentBanner() {
  const { content } = useHoverMessageStore();
  return (
    content && (
      <div className="fixed w-full bottom-0 flex justify-center">
        <Panel
          pt={{
            content: {
              className: "rounded-[10px]! text-[16px]",
            },
          }}
        >
          {content}
        </Panel>
      </div>
    )
  );
}
