import CreateTargetDialog from "./CreateTargetDialog";

export default function TargetListHeader() {
  const [visible, setVisible] = useState(false);
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <p>Targets</p>
        <i
          className="pi pi-plus hover:text-(--primary-color)!"
          onClick={() => setVisible(true)}
        />
      </div>
      {visible && <CreateTargetDialog close={() => setVisible(false)} />}
    </div>
  );
}
