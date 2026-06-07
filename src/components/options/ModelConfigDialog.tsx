import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import {
  useModelConfigMutation,
  useModelConfigQuery,
} from "@/services/modelConfig";
import { ModelProviderProtocol } from "@/common/enums";
import { ModelConfig } from "@/common/types";
import { modelConfigSchema } from "@/common/schemas";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

export default function ModelConfigDialog() {
  const { data, dataUpdatedAt } = useModelConfigQuery();
  const [protocol, setProtocol] = useState(ModelProviderProtocol.OpenAI);
  const [baseURL, setBaseURL] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  useEffect(() => {
    setProtocol(data?.protocol ?? protocol);
    setBaseURL(data?.baseURL ?? baseURL);
    setModel(data?.model ?? model);
    setApiKey(data?.apiKey ?? apiKey);
  }, [dataUpdatedAt]);

  const { mutate } = useModelConfigMutation();
  const toast = useRef<Toast | null>(null);
  async function handleSubmit() {
    const form: ModelConfig = { protocol, baseURL, model, apiKey };
    const { success, data, error } = modelConfigSchema.safeParse(form);
    if (success) {
      mutate(data);
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
          <label htmlFor="protocol" className="font-semibold">
            Protocol
          </label>
          <Dropdown
            value={protocol}
            onChange={(event) => setProtocol(event.value)}
            options={Object.values(ModelProviderProtocol)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="url" className="font-semibold">
            Base URL
          </label>
          <InputText
            id="url"
            value={baseURL}
            onChange={(event) => setBaseURL(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="model" className="font-semibold">
            Model
          </label>
          <InputText
            id="model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="key" className="font-semibold">
            API Key
          </label>
          <InputText
            id="key"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
      <Toast ref={toast} position="center" />
    </Panel>
  );
}
