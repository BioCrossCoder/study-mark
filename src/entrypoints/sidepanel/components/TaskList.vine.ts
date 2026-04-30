import {
  Card,
  InputText,
  ScrollPanel,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "primevue";
import { useTasksQuery } from "@/stores/tasks";
import { isTask, Target, Task } from "@/common/types";
import { PlanType } from "@/common/enums";

export default function TaskList() {
  const tab = ref(PlanType.Task);
  vineExpose({
    tab,
  });

  const { data } = useTasksQuery();
  const records = computed(() => {
    const tasks = new Array<Task>();
    const targets = new Array<Target>();
    Object.values(data.value ?? {}).forEach((item) => {
      (isTask(item) ? tasks : targets).push(item);
    });
    return { tasks, targets };
  });

  const container = ref(document.createElement("div"));
  const header = ref(document.createElement("div"));
  const panelStyle = computed(
    () =>
      `height:${container.value.offsetHeight - header.value.offsetHeight}px`,
  );

  return vine`
    <div class="h-full" ref="container">
      <Tabs v-model:value="tab">
        <div ref="header">
          <TabList>
            <Tab :value="PlanType.Task">
              <div class="flex items-center">
                <i class="pi pi-list mr-2"/>
                <p class="text-base">Tasks</p>
              </div>
            </Tab>
            <Tab :value="PlanType.Target">
              <div class="flex items-center">
                <i class="pi pi-bullseye mr-2"/>
                <p class="text-base">Targets</p>
              </div>
            </Tab>
          </TabList>
        </div>
        <TabPanels :style="panelStyle">
          <TabPanel :value="PlanType.Task">
            <ScrollPanel style="width:100%; height:100%">
              <Card v-for="task in records.tasks" :key="task.id">
                <template #title>{{task.title}}</template>
                <template #subtitle>{{task.state}}</template>
                <template #content>
                  {{task.description}}
                </template>
                <template #footer>
                  <InputText :model-value="task.source" disabled/>
                  <InputText :model-value="task.position" disabled/>
                </template>
              </Card>
            </ScrollPanel>
          </TabPanel>
          <TabPanel :value="PlanType.Target">
            <ScrollPanel style="width:100%; height:100%">
              <Card v-for="target in records.targets" :key="target.id">
                <template #title>{{target.title}}</template>
                <template #subtitle>{{target.state}}</template>
                <template #content>{{target.description}}</template>
              </Card>
            </ScrollPanel>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  `;
}
