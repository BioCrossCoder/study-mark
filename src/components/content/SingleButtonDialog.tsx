import { X } from "lucide-react";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { PropsWithChildren } from "react";

export default function SingleButtonDialog(
  props: PropsWithChildren<{
    close: () => void;
    title: string;
    onSubmit: () => void;
  }>,
) {
  const { close, title, onSubmit, children } = props;
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Panel
        header={
          <div className="flex justify-between items-center">
            <p className="font-semibold text-[20px]">{title}</p>
            <X
              className="hover:cursor-pointer hover:text-red-300"
              onClick={close}
            />
          </div>
        }
        footer={
          <div className="flex justify-center">
            <Button
              label="Save"
              onClick={onSubmit}
              className="text-[14px]! hover:cursor-pointer"
            />
          </div>
        }
        pt={{
          header: {
            className: "rounded-tl-[10px]! rounded-tr-[10px]!",
          },
          footer: {
            className: "rounded-bl-[10px] rounded-br-[10px]",
          },
        }}
      >
        {children}
      </Panel>
    </div>
  );
}
