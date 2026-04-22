import { useRouter } from "vue-router";

export default function App() {
  const router = useRouter();
  onBeforeMount(() => router.replace("/bookmarks"));
  return vine`<RouterView/>`;
}
