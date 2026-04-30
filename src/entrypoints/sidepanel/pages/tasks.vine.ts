import TaskList from "../components/TaskList.vine";
import { ToggleSwitch, Toolbar } from "primevue";
import NavigationGroup from "../components/NavigationGroup.vine";

export default function Page() {
  return vine`
    <div class="h-screen flex flex-col overflow-hidden">
      <TopBar/>
      <TaskList/>
    </div>
  `;
}

function TopBar() {
  function handleCreate() {
    // TODO
  }

  return vine`
    <Toolbar class="border-0!">
      <template #start>
        <NavigationGroup/>
      </template>
      <template #end>
        <i
          class="pi pi-file-plus hover:cursor-pointer hover:text-primary-300"
          @click="handleCreate"
        />
      </template>
    </Toolbar>
  `;
}
