import { MicroLinkApiResp } from "@/common/types";

export function useLoadTabInfo(
  source: Ref<string>,
  title: Ref<string>,
  description: Ref<string>,
) {
  const loading = ref(false);
  async function run() {
    // [LoadTabInfo]
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    source.value = tab.url ?? source.value;
    title.value = tab.title ?? title.value; // [/]
    // [GetDescription]
    if (!source.value) {
      return;
    }
    loading.value = true;
    const resp = await fetch(`https://api.microlink.io?url=${source.value}`);
    loading.value = false;
    if (!resp.ok) {
      return;
    }
    const result = (await resp.json()) as MicroLinkApiResp;
    if (result.status !== "success") {
      return;
    }
    description.value = result.data.description ?? description.value; // [/]
  }
  return { loading, run };
}
