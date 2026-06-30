import {
  AccordionIndex,
  DialogType,
  ListStyle,
  StoreKey,
  TabIndex,
} from "@/common/enums";
import { DialogForm } from "@/common/types";

export const uiStateData = storage.defineItem(StoreKey.UiState, {
  fallback: {
    tabIndex: TabIndex.Plan,
    accordionIndex: AccordionIndex.Tasks,
    listStyle: ListStyle.Card,
    taskSearchQuery: "",
    targetSearchQuery: "",
    activeDialog: {
      type: DialogType.None,
      id: "",
      form: {} as DialogForm[DialogType],
    },
  },
});

export async function updateTabIndex(index: TabIndex) {
  const data = await uiStateData.getValue();
  data.tabIndex = index;
  await uiStateData.setValue(data);
}

export async function updateAccordionIndex(index: AccordionIndex) {
  const data = await uiStateData.getValue();
  data.accordionIndex = index;
  await uiStateData.setValue(data);
}

export async function updateListStyle(style: ListStyle) {
  const data = await uiStateData.getValue();
  data.listStyle = style;
  await uiStateData.setValue(data);
}

export async function openDialog<T extends DialogType>(
  type: T,
  id: string,
  form: DialogForm[T],
) {
  const data = await uiStateData.getValue();
  data.activeDialog = { type, id, form };
  await uiStateData.setValue(data);
}

export async function closeDialog() {
  const data = await uiStateData.getValue();
  data.activeDialog = {
    type: DialogType.None,
    id: "",
    form: {},
  };
  await uiStateData.setValue(data);
}

export async function updateDialogForm(form: DialogForm[DialogType]) {
  const data = await uiStateData.getValue();
  data.activeDialog.form = form;
  await uiStateData.setValue(data);
}

export async function updateTaskSearchQuery(query: string) {
  const data = await uiStateData.getValue();
  data.taskSearchQuery = query;
  await uiStateData.setValue(data);
}

export async function updateTargetSearchQuery(query: string) {
  const data = await uiStateData.getValue();
  data.targetSearchQuery = query;
  await uiStateData.setValue(data);
}