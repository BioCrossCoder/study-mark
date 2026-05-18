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
import { Resource, signalMessageSchema, Target, Task } from "@/common/types";
import { ObjectType, Signal, statusIcon } from "@/common/enums";
import UpdateTaskDialog from "./UpdateTaskDialog.vine";
import UpdateTargetDialog from "./UpdateTargetDialog.vine";
import { useRelationsQuery } from "@/stores/relations";
import { useNotice } from "@/composables/useNotice";
import { useConnectionStore } from "../stores/connection";
import UpdateResourceDialog from "./UpdateResourceDialog.vine";

export default function TaskData() {
  const tab = ref(ObjectType.Task);
  vineExpose({
    tab,
  });

  const { data, refetch } = useTasksQuery();
  const relationsQuery = useRelationsQuery();
  const connection = useConnectionStore();
  connection.listen((message) => {
    // [UpdateViewOnDataUpdate]
    const signalMessage = signalMessageSchema.safeParse(message);
    if (
      signalMessage.success &&
      signalMessage.data.content === Signal.UpdateTask
    ) {
      refetch();
      relationsQuery.refetch();
    } // [/]
  });
  const records = computed(() => {
    const tasks = new Array<Task>();
    const targets = new Array<Target>();
    const resources = new Array<Resource>();
    Object.values(data.value ?? {}).forEach((item) => {
      switch (item.type) {
        case ObjectType.Task:
          tasks.push(item);
          break;
        case ObjectType.Target:
          targets.push(item);
          break;
        case ObjectType.Resource:
          resources.push(item);
          break;
      }
    });
    tasks.sort((a, b) => b.createAt - a.createAt);
    targets.sort((a, b) => b.createAt - a.createAt);
    resources.sort((a, b) => b.createAt - a.createAt);
    return { tasks, targets, resources };
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
            <Tab :value="ObjectType.Task">
              <div class="flex items-center">
                <i class="pi pi-list mr-2"/>
                <p class="text-base">Tasks</p>
              </div>
            </Tab>
            <Tab :value="ObjectType.Target">
              <div class="flex items-center">
                <i class="pi pi-bullseye mr-2"/>
                <p class="text-base">Targets</p>
              </div>
            </Tab>
            <Tab :value="ObjectType.Resource">
              <div class="flex items-center">
                <i class="pi pi-globe mr-2"/>
                <p class="text-base">Resources</p>
              </div>
            </Tab>
          </TabList>
        </div>
        <TabPanels :style="panelStyle">
          <TabPanel :value="ObjectType.Task" class="h-full">
            <TaskList :data="records"/>
          </TabPanel>
          <TabPanel :value="ObjectType.Target" class="h-full">
            <TargetList :data="records"/>
          </TabPanel>
          <TabPanel :value="ObjectType.Resource" class="h-full">
            <ResourceList :data="records"/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  `;
}

function handleOpenLink(url: string) {
  browser.tabs.create({ url });
}

function TaskList(props: { data: { tasks: Task[] } }) {
  const { remove } = useTasksMutation();
  function handleDelete(id: string) {
    remove(id);
  }

  const { showInfo } = useNotice();
  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    showInfo("Task title copied!");
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
      <Card v-for="item in data.tasks" :key="item.id" class="border mb-5 mx-3">
        <template #title>
          <div class="flex justify-between items-center">
            <div class="flex items-center justify-between">
              <p
                class="hover:cursor-copy hover:text-primary-300"
                @click="()=>handleCopy(item.title)"
              >
                {{item.title}}
              </p>
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
    <ConfirmDialog class="w-6/7"/>
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

function ResourceList(props: { data: { resources: Resource[] } }) {
  const { remove } = useTasksMutation();
  function handleDelete(id: string) {
    remove(id);
  }

  const dialog = ref({ open: (_: string) => {} });
  function handleUpdate(id: string) {
    dialog.value.open(id);
  }

  return vine`
     <ScrollPanel style="width:100%; height:100%">
      <Card v-for="item in data.resources" :key="item.id" class="border mb-5 mx-3">
        <template #title>
          <div class="flex justify-between items-center">
            <div class="flex items-center justify-between">
              <p>{{item.title}}</p>
            </div>
            <div class="flex justify-between items-center gap-4">
              <i
                class="pi pi-external-link hover:cursor-pointer hover:text-primary-300"
                @click="()=>handleOpenLink(item.source)"
              />
              <i
                class="pi pi-pen-to-square hover:cursor-pointer hover:text-primary-300"
                @click="()=>handleUpdate(item.id)"
              />
              <i
                class="pi pi-trash hover:cursor-pointer hover:text-red-400"
                @click="()=>handleDelete(item.id)"
              />
            </div>
          </div>
        </template>
        <template #content>{{item.description}}</template>
      </Card>
    </ScrollPanel>
    <UpdateResourceDialog ref="dialog"/>
  `;
}
