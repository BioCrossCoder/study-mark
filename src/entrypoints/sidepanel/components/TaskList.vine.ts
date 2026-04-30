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

export default function TaskList() {
  const { data } = useTasksQuery();
  const records = computed(() => {
    const tasks = new Array<Task>();
    const targets = new Array<Target>();
    Object.values(data.value ?? {}).forEach((item) => {
      (isTask(item) ? tasks : targets).push(item);
    });
    return { tasks, targets };
  });

  return vine`
    <Tabs value="0">
      <TabList>
        <Tab value="0">
          <div class="flex items-center">
            <i class="pi pi-list mr-2"/>
            <p class="text-base">Tasks</p>
          </div>
        </Tab>
        <Tab value="1">
          <div class="flex items-center">
            <i class="pi pi-bullseye mr-2"/>
            <p class="text-base">Targets</p>
          </div>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <ScrollPanel style="width:100%; height:100%">
            <Card v-for="target in records.targets" :key="target.id">
              <template #title>{{target.title}}</template>
              <template #subtitle>{{target.state}}</template>
              <template #content>{{target.description}}</template>
            </Card>
          </ScrollPanel>
        </TabPanel>
        <TabPanel value="1">
          <ScrollPanel style="width:100%; height:100%">
            <Card v-for="task in records.tasks" :key="task.id">
              <template #title>{{task.title}}</template>
              <template #subtitle>{{task.state}}</template>
              <template #content>
                {{task.description}}
              </template>
              <template #footer>
                <InputText :model-value="task.source" disabled/>
                <InputText :model-value="task.bookmark" disabled/>
              </template>
            </Card>
          </ScrollPanel>
        </TabPanel>
      </TabPanels>
    </Tabs>

  `;
}
