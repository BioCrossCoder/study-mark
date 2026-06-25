import { Toast } from "primereact/toast";
import { createContext, createRef, PropsWithChildren } from "react";

export const ToastContext = createContext(createRef<Toast>());

export function ToastContextProvider(props: PropsWithChildren) {
  const toast = useRef<Toast>(null);
  return (
    <>
      <ToastContext.Provider value={toast}>
        {props.children}
      </ToastContext.Provider>
      <Toast ref={toast} position="center" />
    </>
  );
}
