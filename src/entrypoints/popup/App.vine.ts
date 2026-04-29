import { RouterView, useRouter } from "vue-router";

export default function App() {
  const router = useRouter();
  onMounted(() => {
    router.replace("/popup");
  });
  return vine`<RouterView/>`;
}
