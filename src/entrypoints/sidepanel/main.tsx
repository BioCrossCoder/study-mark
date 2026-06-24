import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import ReactContainer from "@/components/common/ReactContainer.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ReactContainer toastPosition="center">
    <App />
  </ReactContainer>,
);
