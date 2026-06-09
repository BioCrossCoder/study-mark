import { Card } from "primereact/card";
import { Chip } from "primereact/chip";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useId } from "react";

export default function TargetFormCard(props: {
  value: { name: string; description: string };
  onChange: (value: { name: string; description: string }) => void;
}) {
  const { value, onChange } = props;
  const nameId = useId();
  const descriptionId = useId();
  return (
    <Card className="bg-(--highlight-bg)!" title={<Chip label="Target" />}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label htmlFor={nameId}>Name</label>
          <InputText
            id={nameId}
            value={value.name}
            onChange={(event) => {
              value.name = event.target.value;
              onChange(value);
            }}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor={descriptionId}>Description</label>
          <InputTextarea
            id={descriptionId}
            value={value.description}
            onChange={(event) => {
              value.description = event.target.value;
              onChange(value);
            }}
            autoComplete="off"
          />
        </div>
      </div>
    </Card>
  );
}
