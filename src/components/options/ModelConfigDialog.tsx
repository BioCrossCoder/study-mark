import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { ModelProviderProtocol } from "@/common/enums";
import { ModelConfig } from "@/common/types";
import { modelConfigSchema } from "@/common/schemas";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useId } from "react";
import { modelConfigData } from "@/services/storage/modelConfig";
import { useModelConfigData } from "@/services/modelConfig";
import { Password } from "primereact/password";

export default function ModelConfigDialog() {
  const [protocol, setProtocol] = useState(ModelProviderProtocol.OpenAI);
  const protocolId = useId();
  const [baseURL, setBaseURL] = useState("");
  const urlId = useId();
  const [model, setModel] = useState("");
  const modelId = useId();
  const [apiKey, setApiKey] = useState("");
  const keyId = useId();

  const data = useModelConfigData();
  useEffect(() => {
    setProtocol(data.protocol);
    setBaseURL(data.baseURL);
    setModel(data.model);
    setApiKey(data.apiKey);
  }, [data]);

  const toast = useRef<Toast | null>(null);

  async function handleSubmit() {
    const form: ModelConfig = { protocol, baseURL, model, apiKey };
    const { success, data, error } = modelConfigSchema.safeParse(form);
    if (success) {
      await modelConfigData.setValue(data);
      toast.current?.show({
        severity: "success",
        summary: "Update Model Config Succeeded",
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Update Model Config Failed",
        detail: error.message,
      });
    }
  }
  return (
    <Panel
      header="Model Config"
      footer={
        <div className="flex justify-end">
          <Button label="Save" onClick={handleSubmit} />
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label htmlFor={protocolId} className="font-semibold">
            Protocol
          </label>
          <Dropdown
            inputId={protocolId}
            value={protocol}
            onChange={(event) => setProtocol(event.value)}
            options={Object.values(ModelProviderProtocol)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor={urlId} className="font-semibold">
            Base URL
          </label>
          <InputText
            id={urlId}
            value={baseURL}
            onChange={(event) => setBaseURL(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor={modelId} className="font-semibold">
            Model
          </label>
          <InputText
            id={modelId}
            value={model}
            onChange={(event) => setModel(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor={keyId} className="font-semibold">
            API Key
          </label>
          <Password
            id={keyId}
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            autoComplete="off"
            pt={{
              input: {
                className: "w-full",
              },
            }}
            feedback={false}
          />
        </div>
      </div>
      <Toast ref={toast} position="center" />
    </Panel>
  );
}
