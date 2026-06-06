import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ReactNode } from "react";

type FormField = {
  name: string;
  label?: ReactNode;
  item: ReactNode;
};

export default function FormDialog(props: {
  header: string;
  fields: FormField[];
  onSubmit: () => Promise<Error | unknown>;
  onHide: () => void;
  disabled?: boolean;
}) {
  const { header, fields, onHide, disabled } = props;
  async function handleSubmit() {
    if (!Error.isError(await props.onSubmit())) {
      onHide();
    }
  }
  return (
    <Dialog
      visible={true}
      className="w-6/7 max-h-5/8!"
      onHide={onHide}
      draggable={false}
      header={header}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            label="Cancel"
            size="small"
            severity="secondary"
            onClick={onHide}
          />
          <Button
            label="Submit"
            size="small"
            onClick={handleSubmit}
            disabled={disabled}
          />
        </div>
      }
    >
      {fields.map(({ name, item, label }) => (
        <div className="flex flex-col mb-4" key={name}>
          <label htmlFor={name.toLowerCase()} className="text-lg">
            {label ?? name}
          </label>
          {item}
        </div>
      ))}
    </Dialog>
  );
}
