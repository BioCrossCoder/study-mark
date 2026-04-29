import { Toolbar } from "primevue";
import NavigationGroup from "../components/NavigationGroup.vine";

export default function Page() {
  return vine`
    <div class="h-screen flex flex-col overflow-hidden">
      <TopBar/>
    </div>
  `;
}

function TopBar() {
  return vine`
    <Toolbar class="border-0!">
      <template #start>
        <NavigationGroup/>
      </template>
    </Toolbar>
  `;
}
