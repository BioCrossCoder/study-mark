import { useRoute, useRouter } from "vue-router";
import { SelectButton } from "primevue";

const icons: Record<string, string> = {
  "/sidepanel/": "pi pi-comments",
  "/sidepanel/favorites": "pi pi-star",
  "/sidepanel/tasks": "pi pi-list",
};

export default function NavigationGroup() {
  const options = Object.keys(icons);
  const route = useRoute();
  const router = useRouter();
  const option = computed({
    get: () => route.name,
    set: (value) => {
      if (!value) {
        return;
      }
      if (route.name !== value) {
        router.push(value);
      }
    },
  });

  return vine`
    <SelectButton
      v-model="option"
      :options="options"
    >
      <template #option="{option}">
        <i :class="icons[option]" />
      </template>
    </SelectButton>
  `;
}
