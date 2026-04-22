import { RouterView, useRouter } from "vue-router";

export default function App() {
  const router = useRouter();
  onBeforeMount(() => router.push("/popup"));
  return vine`<RouterView/>`;
}
