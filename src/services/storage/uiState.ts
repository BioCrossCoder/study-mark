import { AccordionIndex, ListStyle, StoreKey, TabIndex } from "@/common/enums";

export const uiStateData = storage.defineItem(StoreKey.UiState, {
  fallback: {
    tabIndex: TabIndex.Plan,
    accordionIndex: AccordionIndex.Tasks,
    listStyle: ListStyle.Card,
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
