import { Card } from "primereact/card";
import { PropsWithChildren } from "react";

export default function BackgroundPanel(props: PropsWithChildren) {
  return (
    <Card
      className="h-full w-full"
      pt={{
        body: {
          className: "p-0!",
        },
        content: {
          className: "p-0!",
        },
      }}
    >
      {props.children}
    </Card>
  );
}
