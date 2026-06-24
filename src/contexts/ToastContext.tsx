import { Position } from "@/common/types";
import { Toast } from "primereact/toast";
import { createContext, createRef, PropsWithChildren } from "react";

export const ToastContext = createContext(createRef<Toast>());

export function ToastContextProvider(
  props: PropsWithChildren<{ position: Position }>,
) {
  const { position, children } = props;
  const toast = useRef<Toast>(null);
  return (
    <>
      <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
      <Toast ref={toast} position={position} />
    </>
  );
}
