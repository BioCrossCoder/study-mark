import {
  updateAccordionIndex,
  updateListStyle,
  updateTaskSearchQuery,
  updateTargetSearchQuery,
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
import SearchBox from "@/components/common/SearchBox";

export default function PlanList() {
  const { accordionIndex, listStyle, taskSearchQuery, targetSearchQuery } =
    useUiStateData();
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
        <AccordionTab
          header={<TaskListHeader />}
          pt={{ content: { className: "p-0!" } }}
        >
          <SearchBox value={taskSearchQuery} onChange={updateTaskSearchQuery} />
          <div className="p-4">
            <ScrollPanel
              style={{ height }}
              pt={{ content: { className: "scrollbar-none" } }}
            >
              <TaskList />
            </ScrollPanel>
          </div>
        </AccordionTab>
        <AccordionTab
          header={<TargetListHeader />}
          pt={{ content: { className: "p-0!" } }}
        >
          <SearchBox
            value={targetSearchQuery}
            onChange={updateTargetSearchQuery}
          />
          <div className="p-4">
            <ScrollPanel
              style={{ height }}
              pt={{ content: { className: "scrollbar-none" } }}
            >
              <TargetList />
            </ScrollPanel>
          </div>
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
