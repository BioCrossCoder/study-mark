import { Message } from "primereact/message";
import { Toast, ToastMessage } from "primereact/toast";
import { createContext, createRef, PropsWithChildren, ReactNode } from "react";

export const ToastContext = createContext(createRef<Toast>());

type Severity =
  | "error"
  | "success"
  | "info"
  | "warn"
  | "secondary"
  | "contrast"
  | undefined;

export function ToastContextProvider(props: PropsWithChildren) {
  const [visible, setVisible] = useState(false);
  const [severity, setSeverity] = useState<Severity>("error");
  const [summary, setSummary] = useState<ReactNode>("");
  const [detail, setDetail] = useState<ReactNode>(undefined);
  const toast = useRef({
    show: (message: ToastMessage) => {
      const { severity, summary, detail, life } = message;
      setSeverity(severity);
      setSummary(summary);
      setDetail(detail);
      setVisible(true);
      setTimeout(() => setVisible(false), life ?? 3000);
    },
  } as Toast);
  return (
    <>
      <ToastContext.Provider value={toast}>
        {props.children}
      </ToastContext.Provider>
      {visible && (
        <div className="fixed w-full flex justify-center">
          <div className="bg-gray-400 rounded-[5px] my-[10px]">
            <Message
              severity={severity}
              text={
                <div className="flex flex-col">
                  <div className="text-[18px]">{summary}</div>
                  {detail && <div className="text-[14px]">{detail}</div>}
                </div>
              }
              icon={<></>}
            />
          </div>
        </div>
      )}
    </>
  );
}
