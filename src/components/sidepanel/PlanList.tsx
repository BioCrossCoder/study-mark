import {
  updateAccordionIndex,
  updateListStyle,
} from "@/services/storage/uiState";
import { useUiStateData } from "@/services/uiState";
import {
  Accordion,
  AccordionTab,
  AccordionTabChangeEvent,
} from "primereact/accordion";
import TaskListHeader from "./TaskListHeader";
import TaskList from "./TaskList";
import TargetListHeader from "./TargetListHeader";
import TargetList from "./TargetList";
import LibraryListHeader from "./LibraryListHeader";
import LibraryList from "./LibraryList";
import CommentHistoryList from "./CommentHistoryList";
import { SelectButton } from "primereact/selectbutton";
import { ListStyle } from "@/common/enums";
import { ScrollPanel } from "primereact/scrollpanel";

export default function PlanList() {
  const { accordionIndex, listStyle } = useUiStateData();
  const height = 250;

  function handleTabChange(event: AccordionTabChangeEvent) {
    updateAccordionIndex(event.index as number);
  }
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SelectButton
        value={listStyle}
        onChange={(event) => {
          if (event.value) {
            updateListStyle(event.value);
          }
        }}
        options={Object.values(ListStyle)}
        pt={{
          root: {
            className: "flex",
          },
          button: {
            className: "flex-1 shadow-none!",
          },
        }}
      />
      <Accordion activeIndex={accordionIndex} onTabChange={handleTabChange}>
        <AccordionTab header={<TaskListHeader />}>
          <ScrollPanel style={{ height }}>
            <TaskList />
          </ScrollPanel>
        </AccordionTab>
        <AccordionTab header={<TargetListHeader />}>
          <ScrollPanel style={{ height }}>
            <TargetList />
          </ScrollPanel>
        </AccordionTab>
        <AccordionTab header={<LibraryListHeader />}>
          <ScrollPanel style={{ height }}>
            <LibraryList />
          </ScrollPanel>
        </AccordionTab>
        <AccordionTab header="Comment History">
          <ScrollPanel style={{ height }}>
            <CommentHistoryList />
          </ScrollPanel>
        </AccordionTab>
      </Accordion>
    </div>
  );
}
