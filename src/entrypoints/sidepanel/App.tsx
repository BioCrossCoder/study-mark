import BackgroundPanel from "@/components/common/BackgroundPanel";
import ChatWindow from "@/components/sidepanel/ChatWindow";
import PlanList from "@/components/sidepanel/PlanList";
import { updateTabIndex } from "@/services/storage/uiState";
import { useUiStateData } from "@/services/uiState";
import { TabPanel, TabView } from "primereact/tabview";

export default function App() {
  const tabView = useRef<TabView>(null);
  const { tabIndex } = useUiStateData();
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
          activeIndex={tabIndex}
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
          <TabPanel
            header="List"
            leftIcon="pi pi-list mr-2"
            pt={{
              content: {
                className: "h-full",
              },
            }}
          >
            <PlanList />
          </TabPanel>
        </TabView>
      </BackgroundPanel>
    </div>
  );
}
