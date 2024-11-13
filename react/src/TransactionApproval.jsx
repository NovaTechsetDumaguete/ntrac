import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Separator } from "@ui/separator";
import { columns } from "@/components/extra/transaction-approval/columns";
import { DataTable } from "@/components/extra/transaction-approval/data-table";
import axiosClient from "./lib/axios-client";
import { DatePicker } from "./components/extra/date-picker";
import { useStateContext } from "@/context/ContextProvider";
import { useDashboardContext } from "@/context/DashboardContextProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransactionApproval = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, currentTeam, setWaitingForApprovalCount } = useStateContext();
  const { date } = useDashboardContext();


  const fetchData = async () => {
    if (currentTeam) {
      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        const response = await axiosClient.get("/viewRequestApprovalWManager", {
          params: {
            managerid: currentTeam,
            date: formattedDate,
          },
        });
        if (response.data && response.data.data) {
          setData(response.data.data);

          // Update the notification count in the context
          const pendingCount = response.data.data.filter(
            (item) => item.status === "Pending"
          ).length;
          setWaitingForApprovalCount(pendingCount);
        }
      } catch (error) {
        console.error("Error fetching data", error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, user, currentTeam]);

  return (
    <div className="h-full px-1 py-3 lg:px-4">
      <ToastContainer />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Transaction Approval
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <DatePicker />
        </div>
      </div>
      <Separator className="my-2" />
      <div className="relative">
        <div className="h-full flex-1 flex-col space-y-4 p-4 md:flex">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <DataTable columns={columns(fetchData, currentTeam)} data={data} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionApproval;
