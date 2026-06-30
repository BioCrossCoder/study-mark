import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { ChangeEvent } from "react";

export default function SearchBox(props: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [value, setValue] = useState(props.value);
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
    props.onChange(event.target.value);
  }
  return (
    <IconField>
      <InputIcon className="pi pi-search" />
      <InputText
        value={value}
        onChange={handleChange}
        placeholder="Search"
        className="w-full"
      />
    </IconField>
  );
}
