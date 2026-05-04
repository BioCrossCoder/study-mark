import { Button, Dialog, InputText, Select } from "primevue";
import { ModelConfig, modelConfigSchema } from "@/common/types";
import { useModelConfigMutation, useModelConfigQuery } from "@/stores/config";
import { ModelProviderProtocol } from "@/common/enums";

export default function ChatConfigDialog() {
  const show = ref(false);
  function open() {
    show.value = true;
  }
  function close() {
    show.value = false;
  }
  vineExpose({
    open,
  });

  const protocol = ref(ModelProviderProtocol.OpenAI);
  const options = Object.values(ModelProviderProtocol);

  const baseURL = ref("");
  watch(protocol, (value) => {
    if (value === ModelProviderProtocol.Google) {
      baseURL.value = "https://placeholder.api.com";
    } else {
      baseURL.value = "";
    }
  });

  const model = ref("");
  const apiKey = ref("");
  const { data } = useModelConfigQuery();
  watch(data, (value) => {
    protocol.value = value?.protocol ?? protocol.value;
    baseURL.value = value?.baseURL ?? baseURL.value;
    model.value = value?.model ?? model.value;
    apiKey.value = value?.apiKey ?? apiKey.value;
  });

  const disabled = computed(
    () => baseURL.value.length * model.value.length * apiKey.value.length === 0,
  );

  const { mutate } = useModelConfigMutation();
  const { showError } = useNotice();
  function handleSave() {
    const form: ModelConfig = {
      protocol: protocol.value,
      baseURL: baseURL.value,
      apiKey: apiKey.value,
      model: model.value,
    };
    // [ParseDataFormat]
    const { success, data, error } = modelConfigSchema.safeParse(form);
    if (!success) {
      showError("Update Model Config Failed", error);
      return;
    } // [/]
    mutate(data);
    close();
  }

  return vine`
    <Dialog
      v-model:visible="show"
      modal
      header="AI Model Config"
      class="w-6/7"
      append-to="self"
      :draggable="false"
    >
      <div class="flex flex-col mb-4">
        <label for="provider" class="text-lg">Provider</label>
        <Select label-id="provider" v-model="protocol" :options="options"/>
      </div>
      <div class="flex flex-col mb-4" v-if="protocol !== ModelProviderProtocol.Google">
        <label for="url" class="text-lg">BaseURL</label>
        <InputText
          id="url"
          v-model="baseURL"
          autocomplete="off"
          class="flex-auto h-10 text-base!"
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="model" class="text-lg">Model</label>
        <InputText
          id="model"
          v-model="model"
          autocomplete="off"
          class="flex-auto h-10 text-base!"
          autofocus
        />
      </div>
      <div class="flex flex-col mb-8">
        <label for="key" class="text-lg">API Key</label>
        <InputText
          id="key"
          v-model="apiKey"
          autocomplete="off"
          class="flex-auto h-10 text-base!"
        />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="close"/>
        <Button label="Save" @click="handleSave" :disabled="disabled"/>
      </div>
    </Dialog>
  `;
}
