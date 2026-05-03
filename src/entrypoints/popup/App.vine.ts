import { RouterView, useRouter } from "vue-router";
import { Toast } from "primevue";

export default function App() {
  const router = useRouter();
  onMounted(() => {
    router.replace("/popup");
  });
  return vine`
    <RouterView/>
    <Toast class="w-screen! left-0 top-0!"/>
  `;
}
