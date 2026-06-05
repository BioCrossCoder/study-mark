import { MessagesSquare } from "lucide-react";

export default function ChatEmptyPlaceholder() {
  return (
    <div className="h-full flex justify-center items-center">
      <div className="flex flex-col justify-between items-center">
        <MessagesSquare
          className="w-[min(50vw,50vh)] h-[min(50vw,50vh)]"
          strokeWidth="1.2"
        />
        <div className="flex items-center gap-2">
          <p className="text-lg">Set your AI model through</p>
          <i className="pi pi-cog" />
        </div>
      </div>
    </div>
  );
}
