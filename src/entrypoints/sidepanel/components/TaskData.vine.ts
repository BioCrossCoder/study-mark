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
import { useTasksMutation, useTasksQuery } from "@/stores/tasks";
import { isTask, Target, Task } from "@/common/types";
import { PlanType, statusIcon } from "@/common/enums";

export default function TaskData() {
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
          <TabPanel :value="PlanType.Task" class="h-full">
            <TaskList :data="records.tasks"/>
          </TabPanel>
          <TabPanel :value="PlanType.Target" class="h-full">
            <TargetList :data="records.targets"/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  `;
}

function TaskList(props: { data: Task[] }) {
  const { remove } = useTasksMutation();
  function handleDelete(id: string) {
    remove(id);
  }

  function handleOpenLink(url: string) {
    browser.tabs.create({ url });
  }

  return vine`
    <ScrollPanel style="width:100%; height:100%">
      <Card v-for="task in data" :key="task.id" class="border mb-5 mx-3">
        <template #title>
          <div class="flex justify-between items-center">
            <div class="flex items-center justify-between">
              <p>{{task.title}}</p>
              <i :class="statusIcon[task.state]+' px-2'"/>
            </div>
            <i
              class="pi pi-trash hover:cursor-pointer hover:text-red-400"
              @click="()=>handleDelete(task.id)"
            />
          </div>
        </template>
        <template #content>
          {{task.description}}
        </template>
        <template #footer>
          <div class="flex justify-between">
            <div
              class="flex items-center hover:cursor-pointer hover:text-primary-300"
              @click="()=>handleOpenLink(task.source)"
            >
              <i class="pi pi-link"/>
              <p class="p-2">Source</p>
            </div>
            <div
              class="flex items-center hover:cursor-pointer hover:text-primary-300"
              @click="()=>handleOpenLink(task.position)"
            >
              <i class="pi pi-link"/>
              <p class="p-2">Position</p>
            </div>
          </div>
        </template>
      </Card>
    </ScrollPanel>
  `;
}

function TargetList(props: { data: Target[] }) {
  const { remove } = useTasksMutation();
  function handleDelete(id: string) {
    remove(id);
  }

  return vine`
    <ScrollPanel style="width:100%; height:100%">
      <Card v-for="target in data" :key="target.id" class="border mb-5 mx-3">
        <template #title>
          <div class="flex justify-between items-center">
            <div class="flex items-center justify-between">
              <p>{{target.title}}</p>
              <i :class="statusIcon[target.state]+' px-2'"/>
            </div>
            <i
              class="pi pi-trash hover:cursor-pointer hover:text-red-400"
              @click="()=>handleDelete(target.id)"
            />
          </div>
        </template>
        <template #content>{{target.description}}</template>
      </Card>
    </ScrollPanel>
  `;
}
