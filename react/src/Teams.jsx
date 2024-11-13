import { DashboardContextProvider } from "@/context/DashboardContextProvider";
import { Separator } from "@ui/separator";
import { columns } from "@/components/extra/team/columns";
import { DataTable } from "@/components/extra/team/data-table";
import { useEffect, useState } from "react";
import axiosClient from "./lib/axios-client";
import moment from "moment";

const Teams = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axiosClient
      .get("/userapproval")
      .then(async ({ data }) => {
        let tmpData = [];
        await data.data.forEach((item) => {
          tmpData.push({
            id: item.id,
            employeeId: item.employee_id,
            name: `${item.first_name} ${item.last_name}`,
            status: item.status,
            requestedOn: moment(item.created_at).format("YYYY-MM-DD"),
          });
        });
        setData(tmpData);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <DashboardContextProvider>
      <div className="h-full px-4 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              User Registration Approval
            </h2>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="relative">
          <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <DataTable data={data} columns={columns} />
          </div>
        </div>
      </div>
    </DashboardContextProvider>
  );
};

export default Teams;
