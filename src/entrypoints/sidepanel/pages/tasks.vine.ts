import TaskData from "../components/TaskData.vine";
import { ToggleSwitch, Toolbar } from "primevue";
import NavigationGroup from "../components/NavigationGroup.vine";
import CreateTaskDialog from "../components/CreateTaskDialog.vine";
import { ObjectType } from "@/common/enums";
import CreateTargetDialog from "../components/CreateTargetDialog.vine";
import CreateResourceDialog from "../components/CreateResourceDialog.vine";

export default function Page() {
  const list = ref({ tab: ObjectType.Task });

  return vine`
    <div class="h-screen flex flex-col overflow-hidden">
      <TopBar :tab="list.tab"/>
      <TaskData ref="list"/>
    </div>
  `;
}

function TopBar(props: { tab: ObjectType }) {
  const dialog = ref({ open: () => {} });
  function handleCreate() {
    dialog.value.open();
  }

  return vine`
    <Toolbar class="border-0!">
      <template #start>
        <NavigationGroup/>
      </template>
      <template #end>
        <i
          class="pi pi-calendar-plus hover:cursor-pointer hover:text-primary-300"
          @click="handleCreate"
        />
        <CreateTaskDialog v-if="tab === ObjectType.Task" ref="dialog"/>
        <CreateTargetDialog v-if="tab === ObjectType.Target" ref="dialog"/>
        <CreateResourceDialog v-if="tab === ObjectType.Resource" ref="dialog"/>
      </template>
    </Toolbar>
  `;
}
