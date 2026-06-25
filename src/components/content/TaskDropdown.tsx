import { useTaskNames, useTaskOptions } from "@/services/task";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { ListBox, ListBoxChangeEvent } from "primereact/listbox";

export default function TaskDropdown(props: {
  value?: string;
  onChange: (event: { value: string | null }) => void;
}) {
  const inputRef = useRef(document.createElement("input"));
  const [visible, setVisible] = useState(false);
  const taskNames = useTaskNames();
  const { value, onChange } = props;
  const options = useTaskOptions();
  function handleChange(event: ListBoxChangeEvent) {
    onChange(event);
    setVisible(false);
  }

  return (
    <div>
      <IconField onClick={() => setVisible(!visible)}>
        <InputText
          placeholder="Select a Task"
          className="text-[16px]! hover:cursor-pointer"
          readOnly={true}
          ref={inputRef}
          value={taskNames[value ?? ""]}
        />
        <InputIcon className="pi pi-angle-down text-[16px]! hover:cursor-pointer" />
      </IconField>
      {visible && (
        <ListBox
          value={value}
          onChange={handleChange}
          options={options}
          optionLabel="name"
          optionValue="code"
          className="fixed max-h-[300px] text-[16px]!"
          style={{ width: inputRef.current.offsetWidth }}
        />
      )}
    </div>
  );
}
