import { ListStyle } from "@/common/enums";
import BackgroundPanel from "@/components/common/BackgroundPanel";
import ChatWindow from "@/components/sidepanel/ChatWindow";
import CommentHistoryList from "@/components/sidepanel/CommentHistoryList";
import LibraryList from "@/components/sidepanel/LibraryList";
import LibraryListHeader from "@/components/sidepanel/LibraryListHeader";
import TargetList from "@/components/sidepanel/TargetList";
import TargetListHeader from "@/components/sidepanel/TargetListHeader";
import TaskList from "@/components/sidepanel/TaskList";
import TaskListHeader from "@/components/sidepanel/TaskListHeader";
import {
  updateAccordionIndex,
  updateListStyle,
  updateTabIndex,
} from "@/services/storage/uiState";
import { useUiStateData } from "@/services/uiState";
import { Accordion, AccordionTab } from "primereact/accordion";
import { SelectButton } from "primereact/selectbutton";
import { TabPanel, TabView } from "primereact/tabview";

export default function App() {
  const tabView = useRef<TabView>(null);
  const data = useUiStateData();
  const [navHeight, setNavHeight] = useState(0);
  useEffect(() => {
    const nav = tabView.current
      ?.getElement()
      ?.querySelector(".p-tabview-nav") as HTMLUListElement | null;
    if (nav) {
      setNavHeight(nav.offsetHeight);
    }
  }, []);
  const height = useMemo(() => `calc(100vh - ${navHeight}px)`, [navHeight]);
  return (
    <div className="h-screen w-screen overflow-hidden">
      <BackgroundPanel>
        <TabView
          ref={tabView}
          pt={{
            panelContainer: {
              className: "p-0! overflow-y-auto scrollbar-none",
              style: {
                height,
              },
            },
          }}
          activeIndex={data.tabIndex}
          onTabChange={(event) => updateTabIndex(event.index)}
        >
          <TabPanel
            header="Plan"
            leftIcon="pi pi-comments mr-2"
            pt={{
              content: {
                className: "h-full",
              },
            }}
          >
            <ChatWindow />
          </TabPanel>
          <TabPanel header="List" leftIcon="pi pi-list mr-2">
            <SelectButton
              value={data.listStyle}
              onChange={(event) => updateListStyle(event.value)}
              options={Object.values(ListStyle)}
              pt={{
                root: {
                  className: "flex",
                },
                button: {
                  className: "flex-1",
                },
              }}
            />
            <Accordion
              activeIndex={data.accordionIndex}
              onTabChange={(event) =>
                updateAccordionIndex(event.index as number)
              }
            >
              <AccordionTab header={<TaskListHeader />}>
                <TaskList />
              </AccordionTab>
              <AccordionTab header={<TargetListHeader />}>
                <TargetList />
              </AccordionTab>
              <AccordionTab header={<LibraryListHeader />}>
                <LibraryList />
              </AccordionTab>
              <AccordionTab header="Comment History">
                <CommentHistoryList />
              </AccordionTab>
            </Accordion>
          </TabPanel>
        </TabView>
      </BackgroundPanel>
    </div>
  );
}
