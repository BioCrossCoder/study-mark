import { MessagesSquare } from "lucide-react";
import { Button } from "primereact/button";

export default function ChatEmptyPlaceholder() {
  return (
    <div className="h-full flex justify-center items-center">
      <div className="flex flex-col justify-between items-center">
        <MessagesSquare
          className="w-[min(50vw,50vh)] h-[min(50vw,50vh)]"
          strokeWidth="1.2"
        />
        <div className="flex items-center gap-2">
          <p className="text-lg">
            Click
            <Button
              icon="pi pi-cog"
              className="h-8 w-8! mx-2!"
              onClick={() => browser.runtime.openOptionsPage()}
            />
            to set your AI model
          </p>
        </div>
      </div>
    </div>
  );
}
