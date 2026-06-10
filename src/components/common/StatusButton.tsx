import { ExecStatus, statusIcon } from "@/common/enums";
import { SplitButton } from "primereact/splitbutton";

export default function StatusButton(props: {
  status: ExecStatus;
  callback: (value: ExecStatus) => void;
}) {
  const { status, callback } = props;
  const items = Object.entries(statusIcon).map(([label, icon]) => ({
    icon,
    label,
    command: () => callback(label as ExecStatus),
  }));
  return (
    <SplitButton
      text
      dropdownIcon={statusIcon[status]}
      size="small"
      model={items}
      menuClassName="w-25!"
      pt={{
        button: {
          root: {
            className: "hidden!",
          },
        },
        menuButton: {
          root: {
            className: "shadow-none! rounded!",
          },
        },
      }}
    />
  );
}
