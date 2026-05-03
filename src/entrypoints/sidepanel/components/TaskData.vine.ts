import {
  Button,
  Card,
  ConfirmDialog,
  InputText,
  ScrollPanel,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  useConfirm,
} from "primevue";
import { useTasksMutation, useTasksQuery } from "@/stores/tasks";
import { Target, Task } from "@/common/types";
import { PlanType, Signal, statusIcon } from "@/common/enums";
import UpdateTaskDialog from "./UpdateTaskDialog.vine";
import UpdateTargetDialog from "./UpdateTargetDialog.vine";
import { useRelationsQuery } from "@/stores/relations";
import { useNotice } from "@/composables/useNotice";
import { useConnectionStore } from "../stores/connection";

export default function TaskData() {
  const tab = ref(PlanType.Task);
  vineExpose({
    tab,
  });

  const { data, refetch } = useTasksQuery();
  const relationsQuery = useRelationsQuery();
  const connection = useConnectionStore();
  connection.listen((message) => {
    if (message === Signal.UpdateTask) {
      refetch();
      relationsQuery.refetch();
    }
  });
  const records = computed(() => {
    const tasks = new Array<Task>();
    const targets = new Array<Target>();
    Object.values(data.value ?? {}).forEach((item) => {
      switch (item.type) {
        case PlanType.Task:
          tasks.push(item);
          break;
        case PlanType.Target:
          targets.push(item);
          break;
      }
    });
    tasks.sort((a, b) => b.createAt - a.createAt);
    targets.sort((a, b) => b.createAt - a.createAt);
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
            <TaskList :data="records"/>
          </TabPanel>
          <TabPanel :value="PlanType.Target" class="h-full">
            <TargetList :data="records"/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  `;
}

function TaskList(props: { data: { tasks: Task[] } }) {
  const { save, remove } = useTasksMutation();
  function handleDelete(id: string) {
    remove(id);
  }

  const dialog = ref({ open: (_: string) => {} });
  function handleUpdate(id: string) {
    dialog.value.open(id);
  }

  function handleOpenLink(url: string) {
    browser.tabs.create({ url });
  }

  const confirm = useConfirm();
  const { showError } = useNotice();
  async function handleSave(item: Task) {
    const tab = (
      await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
    confirm.require({
      message: "Save current page as position of this task?",
      header: "Confirmation",
      icon: "pi pi-check-circle",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true,
      },
      acceptProps: {
        label: "Save",
      },
      accept: async () => {
        const result = await save({
          ...item,
          position: tab.url ?? item.position,
        });
        if (result.isErr()) {
          showError("Save Position Failed", result.error);
        }
      },
    });
  }

  const { mapping } = useRelationsQuery();
  const { data: d } = useTasksQuery();
  const relatedItems = computed(() => d.value ?? {});

  return vine`
    <ScrollPanel style="width:100%; height:100%">
      <Card v-for="item in data.tasks" :key="item.id" class="border mb-5 mx-3">
        <template #title>
          <div class="flex justify-between items-center">
            <div class="flex items-center justify-between">
              <p>{{item.title}}</p>
              <i :class="statusIcon[item.state]+' mx-2 text-primary-300'"/>
            </div>
            <div class="flex justify-between items-center">
              <i
                class="pi pi-pen-to-square hover:cursor-pointer hover:text-primary-300 mr-4"
                @click="()=>handleUpdate(item.id)"
              />
              <i
                class="pi pi-trash hover:cursor-pointer hover:text-red-400"
                @click="()=>handleDelete(item.id)"
              />
            </div>
          </div>
        </template>
        <template #subtitle>
          <div class="grid grid-cols-3 gap-4">
            <Tag v-for="id in mapping[item.id]" :value="relatedItems[id].title"/>
          </div>
        </template>
        <template #content>
          {{item.description}}
        </template>
        <template #footer>
          <div class="flex justify-between">
            <div class="flex gap-2">
            <Button label="Open" size="small" @click="handleOpenLink(item.position)"/>
            <Button label="Save" size="small" @click="handleSave(item)"/>
            </div>
            <div
              class="flex items-center hover:cursor-pointer hover:text-primary-300"
              @click="()=>handleOpenLink(item.source)"
            >
              <i class="pi pi-link"/>
              <p class="p-2">Source</p>
            </div>
          </div>
        </template>
      </Card>
    </ScrollPanel>
    <UpdateTaskDialog ref="dialog"/>
    <ConfirmDialog/>
  `;
}

function TargetList(props: { data: { targets: Target[] } }) {
  const { remove } = useTasksMutation();
  function handleDelete(id: string) {
    remove(id);
  }

  const dialog = ref({ open: (_: string) => {} });
  function handleUpdate(id: string) {
    dialog.value.open(id);
  }

  const { mapping } = useRelationsQuery();
  const { data: d } = useTasksQuery();
  const relatedItems = computed(() => d.value ?? {});

  return vine`
    <ScrollPanel style="width:100%; height:100%">
      <Card v-for="item in data.targets" :key="item.id" class="border mb-5 mx-3">
        <template #title>
          <div class="flex justify-between items-center">
            <div class="flex items-center justify-between">
              <p>{{item.title}}</p>
              <i :class="statusIcon[item.state]+' mx-2 text-primary-300'"/>
            </div>
            <div class="flex justify-between items-center">
              <i
                class="pi pi-pen-to-square hover:cursor-pointer hover:text-primary-300 mr-4"
                @click="()=>handleUpdate(item.id)"
              />
              <i
                class="pi pi-trash hover:cursor-pointer hover:text-red-400"
                @click="()=>handleDelete(item.id)"
              />
            </div>
          </div>
        </template>
        <template #subtitle>
          <div class=" grid grid-cols-2 gap-4">
            <Tag v-for="id in mapping[item.id]" :value="relatedItems[id].title"/>
          </div>
        </template>
        <template #content>{{item.description}}</template>
      </Card>
    </ScrollPanel>
    <UpdateTargetDialog ref="dialog"/>
  `;
}
