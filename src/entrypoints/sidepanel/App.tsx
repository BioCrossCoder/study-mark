import BackgroundPanel from "@/components/common/BackgroundPanel";
import ChatWindow from "@/components/sidepanel/ChatWindow";
import LibraryList from "@/components/sidepanel/LibraryList";
import LibraryListHeader from "@/components/sidepanel/LibraryListHeader";
import TargetList from "@/components/sidepanel/TargetList";
import TargetListHeader from "@/components/sidepanel/TargetListHeader";
import TaskList from "@/components/sidepanel/TaskList";
import TaskListHeader from "@/components/sidepanel/TaskListHeader";
import { tabIndexData } from "@/services/storage/tabIndex";
import { useTabIndexQuery } from "@/services/tabIndex";
import { Accordion, AccordionTab } from "primereact/accordion";
import { TabPanel, TabView } from "primereact/tabview";

export default function App() {
  const tabView = useRef<TabView>(null);
  const { data: activeIndex } = useTabIndexQuery();
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
          activeIndex={activeIndex}
          onTabChange={(event) => tabIndexData.setValue(event.index)}
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
            <Accordion>
              <AccordionTab header={<TaskListHeader />}>
                <TaskList />
              </AccordionTab>
              <AccordionTab header={<TargetListHeader />}>
                <TargetList />
              </AccordionTab>
              <AccordionTab header={<LibraryListHeader />}>
                <LibraryList />
              </AccordionTab>
            </Accordion>
          </TabPanel>
        </TabView>
      </BackgroundPanel>
    </div>
  );
}
