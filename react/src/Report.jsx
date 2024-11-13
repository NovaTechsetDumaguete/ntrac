import { DashboardContextProvider } from "./context/DashboardContextProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
// import { Toaster } from "@ui/sonner";
import { ReportCard } from "./components/extra/report-card";
import moment from "moment";
import { secondsToHuman } from "./lib/timehash";
import { useEffect, useRef, useState } from "react";
import { AlertDialogTemplate } from "./components/layout/report-alert-dialog";

import ExportHistory from './components/extra/export-history/export-history';
import { echoInstance } from './lib/echo';

export const getWorkDuration = (data, show = true) => {
  if (!moment(data.datein).isSame(moment(), "day") && data.timeout === null) {
    return show ? "No timeout!" : null;
  }

  let diff =
    moment(data.datein).isSame(moment(), "day") && data.timeout === null
      ? moment().diff(moment(data.timein, "HH:mm:ss"), "seconds")
      : moment(data.timeout, "HH:mm:ss").diff(
        moment(data.timein, "HH:mm:ss"),
        "seconds"
      );
  return secondsToHuman(diff);
};

function
Report() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState("attendance");
  const historyRef = useRef(null)

  const handleAppsExport = () => {
    setSelectedModule("applications");
    setDialogOpen(!dialogOpen);
  };
//*
  const handleTrackingExport = () => {
    setSelectedModule("tracking");
    setDialogOpen(!dialogOpen);
  };

  const handleAttendanceExport = async () => {
    setSelectedModule("attendance");
    setDialogOpen(!dialogOpen);
  };

  const handleClickHist = () => historyRef.current?.focus();

  useEffect(() => {
    echoInstance.channel('report')
      .listen('ReportExported', (e) => {
        console.log(e);
      })
  }, [])

  return (
    <DashboardContextProvider>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          </div>
        </div>
        <Tabs defaultValue="generate" className="h-full space-y-6">
          <div className="space-between flex items-center">
            <TabsList>
              <TabsTrigger value="generate" className="relative">
                Generate Export
              </TabsTrigger>
              <TabsTrigger ref={historyRef} value="history">Export History</TabsTrigger>
            </TabsList>
          </div>
          {/* Generate Reports Tab */}
          <TabsContent value="generate">
            <div className="hidden items-start justify-center gap-6 rounded-lg md:grid lg:grid-cols-2 xl:grid-cols-3">
              <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
                <ReportCard
                  title={"Attendance"}
                  description={
                    "Provides information about team member working times, arrival and leaving times."
                  }
                  onClick={handleAttendanceExport}
                />
              </div>
              <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
                <ReportCard
                  title={"Tracking"}
                  description={
                    "Shows all of the applications used by the selected employees and the time spent on each."
                  }
                  onClick={handleTrackingExport}
                />
              </div>
              <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
                <ReportCard
                  title={"Applications"}
                  description={
                    "Provides information about team member working times, arrival and leaving times, and productivity."
                  }
                  onClick={handleAppsExport}
                />
              </div>
              <div className="col-span-2 grid items-start gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1"></div>
            </div>
          </TabsContent>
          <TabsContent value='history'>
            <ExportHistory />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialogTemplate
        title={"Applications Report Data"}
        open={dialogOpen}
        module={selectedModule}
        setDialogOpen={setDialogOpen}
        handleClickHist={handleClickHist}
      >
        {/* <FilterCard /> */}
      </AlertDialogTemplate>
    </DashboardContextProvider>
  );
}

export default Report;
