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
  const [name, setName] = useState(value.name);
  const nameId = useId();
  const [description, setDescription] = useState(value.description);
  const descriptionId = useId();
  useEffect(() => {
    onChange({ name, description });
  }, [name, description]);

  return (
    <Card className="bg-(--highlight-bg)!" title={<Chip label="Target" />}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label htmlFor={nameId}>Name</label>
          <InputText
            id={nameId}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor={descriptionId}>Description</label>
          <InputTextarea
            id={descriptionId}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
    </Card>
  );
}
