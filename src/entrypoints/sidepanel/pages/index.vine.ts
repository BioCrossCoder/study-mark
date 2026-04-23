import { Splitter, SplitterPanel, Toolbar, Tree } from "primevue";
import FavoritesTree from "@/components/FavoritesTree.vine";
import { useRouter } from "vue-router";
import { useSelectionStore } from "@/stores/selections";
export default function Page() {
  const router = useRouter();
  function onClickStar() {
    router.push("/sidepanel/favorites");
  }
  const selection = useSelectionStore().value;
  // TODO add selection to chat
  return vine`
    <div class="h-screen flex flex-col">
      <Toolbar>
        <template #start>
          <i
            class="pi pi-star hover:cursor-pointer hover:text-primary-300"
            @click="onClickStar"
          />
        </template>
      </Toolbar>
      <Splitter layout="vertical" class="h-full">
        <SplitterPanel>
          chat
        </SplitterPanel>
        <SplitterPanel>
          task
        </SplitterPanel>
      </Splitter>
    </div>
  `;
}
