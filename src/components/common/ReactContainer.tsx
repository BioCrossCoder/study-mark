import React, { PropsWithChildren } from "react";
import "@/assets/styles.css";
import { PrimeReactProvider } from "primereact/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContextProvider } from "@/contexts/ToastContext.tsx";
import { ConfirmPopup } from "primereact/confirmpopup";
import { ConfirmDialog } from "primereact/confirmdialog";

export default function ReactContainer(props: PropsWithChildren) {
  const queryClient = new QueryClient();
  return (
    <React.StrictMode>
      <PrimeReactProvider>
        <QueryClientProvider client={queryClient}>
          <ToastContextProvider>
            {props.children}
            <ConfirmPopup />
            <ConfirmDialog />
          </ToastContextProvider>
        </QueryClientProvider>
      </PrimeReactProvider>
    </React.StrictMode>
  );
}
