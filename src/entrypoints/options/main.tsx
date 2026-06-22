import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "../styles.css";
import { PrimeReactProvider } from "primereact/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContextProvider } from "@/contexts/ToastContext.tsx";
import { ConfirmPopup } from "primereact/confirmpopup";
import { ConfirmDialog } from "primereact/confirmdialog";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <QueryClientProvider client={queryClient}>
        <ToastContextProvider>
          <App />
          <ConfirmPopup />
          <ConfirmDialog />
        </ToastContextProvider>
      </QueryClientProvider>
    </PrimeReactProvider>
  </React.StrictMode>,
);
