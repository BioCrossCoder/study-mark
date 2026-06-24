import React, { PropsWithChildren } from "react";
import "@/assets/styles.css";
import { PrimeReactProvider } from "primereact/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContextProvider } from "@/contexts/ToastContext.tsx";
import { ConfirmPopup } from "primereact/confirmpopup";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Position } from "@/common/types";

export default function ReactContainer(
  props: PropsWithChildren<{ toastPosition: Position }>,
) {
  const queryClient = new QueryClient();
  const { toastPosition, children } = props;
  return (
    <React.StrictMode>
      <PrimeReactProvider>
        <QueryClientProvider client={queryClient}>
          <ToastContextProvider position={toastPosition}>
            {children}
            <ConfirmPopup />
            <ConfirmDialog />
          </ToastContextProvider>
        </QueryClientProvider>
      </PrimeReactProvider>
    </React.StrictMode>
  );
}
