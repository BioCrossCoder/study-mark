import { RouterView, useRouter } from "vue-router";

export default function App() {
  const router = useRouter();
  onBeforeMount(() => router.replace("/sidepanel"));
  return vine`<RouterView/>`;
}
