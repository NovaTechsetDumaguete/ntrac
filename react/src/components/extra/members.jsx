import { useEffect, useState } from "react";
import { columns } from "./employee/columns";
import { DataTable } from "./employee/data-table";

const MembersTable = () => {
  const [tasks, setTasks] = useState({});

  useEffect(() => {
    fetch("/employee-status.json")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.employees);
      });
  }, []);
  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <DataTable data={tasks} columns={columns} />
    </div>
  );
};

export default MembersTable;
