import React from "react";
import axiosClient from "@/lib/axios-client";
import {
  DashboardContextProvider,
  useDashboardContext,
} from "@/context/DashboardContextProvider";

// import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./data-table";
import { useStateContext } from "@/context/ContextProvider";
import { columns } from './columns';

const ExportHistory = () => {
  const { date } = useDashboardContext();
  const { currentTeam, user } = useStateContext();

  const { isLoading, data } = useQuery({
    queryKey: ["history", date, currentTeam],
    queryFn: async () => {
      const res = await axiosClient.get("/reports/history", {
        params: {
          userId: user.id,
          teamId: currentTeam
        },
      });

      return res.data.data;
    },
  });

  if (isLoading) {
    return "Loading..."
  }

  return (
    // JSON.stringify(data)
    <DashboardContextProvider>
      <DataTable
        data={data}
        columns={columns}
      // isLoading={isLoading}
      // errir={error}
      />
    </DashboardContextProvider>
  );
};

export default ExportHistory;
