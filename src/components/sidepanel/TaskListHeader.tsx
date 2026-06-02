import CreateTaskDialog from "./CreateTaskDialog";

export default function TaskListHeader() {
  const [visible, setVisible] = useState(false);
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <p>Tasks</p>
        <i
          className="pi pi-plus hover:text-(--primary-color)!"
          onClick={() => setVisible(true)}
        />
      </div>
      {visible && <CreateTaskDialog close={() => setVisible(false)} />}
    </div>
  );
}
