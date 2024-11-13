import { useEffect, useState } from "react";
import { columns } from "./datatable/columns";
import { DataTable } from "./datatable/data-table";

const EmployeeStatus = () => {
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

export default EmployeeStatus;
