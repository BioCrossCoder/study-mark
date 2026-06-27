import { Card } from "primereact/card";
import { Chip } from "primereact/chip";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useId } from "react";

export default function TaskFormCard(props: {
  value: { name: string; description: string; source: string };
  onChange: (value: {
    name: string;
    description: string;
    source: string;
  }) => void;
  order: number;
  onRemove: () => void;
}) {
  const { value, onChange, order, onRemove } = props;
  const [name, setName] = useState(value.name);
  const nameId = useId();
  const [description, setDescription] = useState(value.description);
  const descriptionId = useId();
  const [source, setSource] = useState(value.source);
  const sourceId = useId();
  useEffect(() => {
    onChange({ name, description, source });
  }, [name, description, source]);

  return (
    <Card
      className="bg-(--highlight-bg)!"
      title={
        <div className="flex justify-between items-center">
          <Chip label={`Task ${order}`} />
          <i
            className="pi pi-times-circle hover:cursor-pointer hover:text-red-300"
            onClick={onRemove}
          />
        </div>
      }
    >
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
        <div className="flex flex-col">
          <label htmlFor={sourceId}>Source</label>
          <InputText
            id={sourceId}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
    </Card>
  );
}
