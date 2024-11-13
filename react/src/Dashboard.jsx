import { useEffect, useState } from "react";
import { useDashboardContext } from "@/context/DashboardContextProvider";
// import ActivityChart from "./components/ActivityChart";
import ProductivityChart from "./components/ProductivityChart";
import axiosClient from "@/lib/axios-client";

import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

import { handleAllocateTime, CandleData, secondsToHuman } from "./lib/timehash";

import { TeamAppList } from "./components/extra/team-app-list";
import { DatePicker } from "./components/extra/date-picker";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import TeamWorkHours from "./components/extra/team-work-hours";
import { Skeleton } from "./components/ui/skeleton";
import { useStateContext } from "./context/ContextProvider";

const CATEGORY = ["Unproductive", "Productive", "Neutral"];

function Dashboard() {
  const { date } = useDashboardContext();
  const { currentTeam } = useStateContext();
  const [productivity, setProductivity] = useState([]);
  const [rawApps, setRawApps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [appList, setAppList] = useState({
    Productive: [],
    Unproductive: [],
    Neutral: [],
  });

  const [total, setTotal] = useState({
    productiveHrs: 0,
    late: 0,
    absent: 0,
    present: 0,
  });

  useEffect(() => {
    let tmpTotal = { ...total };
    let productiveHrs = 0;
    appList.Productive.forEach((app) => {
      productiveHrs += app.totalTime;
    });
    setTotal({ ...tmpTotal, productiveHrs: secondsToHuman(productiveHrs) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appList.Productive, currentTeam]);

  // App Listing
  useEffect(() => {
    setIsLoading(true);
    if (!currentTeam) return;
    axiosClient
      .post("/dashboard/apps", {
        date: date,
        teamId: currentTeam,
      })
      .then(async ({ data }) => {
        let listApps = {
          Productive: [],
          Unproductive: [],
          Neutral: [],
        };
        let tmp = [];
        setRawApps(data.data);
        let dataLength = data.data.length;
        let cleanCandle = CandleData(
          data.data[0]?.time,
          data.data[dataLength - 1]?.time,
          date
        ).map((candle) => {
          return {
            label: candle,
            value: 0,
            category: { productive: 0, unproductive: 0, neutral: 0 },
          };
        });

        if (data.data.length === 1) return;
        let { clonedSticks } = handleAllocateTime(data.data, cleanCandle);

        await data.data.forEach((app) => {
          if (app.end_time === null) return;
          let endTime = moment(app.end_time, "H:mm:ss");
          let startTime = moment(app.time, "H:mm:ss");
          let totalTime = moment.duration(endTime.diff(startTime)).asSeconds();

          if (tmp.includes(app.category.header_name)) {
            let index = listApps[
              CATEGORY[app.category.is_productive]
            ].findIndex((x) => {
              return x.name === app.category.header_name;
            });
            listApps[CATEGORY[app.category.is_productive]][index].totalTime +=
              totalTime;
          } else {
            listApps[CATEGORY[app.category.is_productive]].push({
              id: uuidv4(),
              name: app.category.header_name,
              totalTime: totalTime,
              abbreviation: app.category.abbreviation,
              icon: app.category.icon,
            });
            tmp.push(app.category.header_name);
          }
        });

        setProductivity(clonedSticks);
        setAppList(listApps);
      })
      .then(() => setIsLoading(false));
  }, [date, currentTeam]);

  const handleTotalChange = (newTotal) => {
    setTotal(newTotal);
  };

  return (
    <>
      <div className="flex flex-wrap items-center md:justify-between md:flex-nowrap space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold md:text-2xl">
            Dashboard
          </h2>
        </div>
        <div className="shrink ml-auto md:ml-auto lg:ml-auto">
          <DatePicker />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 sm:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productive Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">
              {!isLoading ? (
                total.productiveHrs
              ) : (
                <Skeleton className="w-[140px] h-[32px] bg-slate-200" />
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 640 512"
            >
              <path d="M184 48H328c4.4 0 8 3.6 8 8V96H176V56c0-4.4 3.6-8 8-8zm-56 8V96H64C28.7 96 0 124.7 0 160v96H192 352h8.2c32.3-39.1 81.1-64 135.8-64c5.4 0 10.7 .2 16 .7V160c0-35.3-28.7-64-64-64H384V56c0-30.9-25.1-56-56-56H184c-30.9 0-56 25.1-56 56zM320 352H224c-17.7 0-32-14.3-32-32V288H0V416c0 35.3 28.7 64 64 64H360.2C335.1 449.6 320 410.5 320 368c0-5.4 .2-10.7 .7-16l-.7 0zm320 16a144 144 0 1 0 -288 0 144 144 0 1 0 288 0zM496 288c8.8 0 16 7.2 16 16v48h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H496c-8.8 0-16-7.2-16-16V304c0-8.8 7.2-16 16-16z" />
            </svg>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">{total.late}</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 384 512"
            >
              <path d="M0 24C0 10.7 10.7 0 24 0H360c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V67c0 40.3-16 79-44.5 107.5L225.9 256l81.5 81.5C336 366 352 404.7 352 445v19h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H24c-13.3 0-24-10.7-24-24s10.7-24 24-24h8V445c0-40.3 16-79 44.5-107.5L158.1 256 76.5 174.5C48 146 32 107.3 32 67V48H24C10.7 48 0 37.3 0 24zM110.5 371.5c-3.9 3.9-7.5 8.1-10.7 12.5H284.2c-3.2-4.4-6.8-8.6-10.7-12.5L192 289.9l-81.5 81.5zM284.2 128C297 110.4 304 89 304 67V48H80V67c0 22.1 7 43.4 19.8 61H284.2z" />
            </svg>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">{total.absent}</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 640 512"
            >
              <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L381.9 274c48.5-23.2 82.1-72.7 82.1-130C464 64.5 399.5 0 320 0C250.4 0 192.4 49.3 178.9 114.9L38.8 5.1zM545.5 512H528L284.3 320h-59C136.2 320 64 392.2 64 481.3c0 17 13.8 30.7 30.7 30.7H545.3l.3 0z" />
            </svg>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">{total.present}</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 640 512"
            >
              <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM625 177L497 305c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L591 143c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
            </svg>
          </CardContent>
        </Card>
      </div>
      {/* Adjust here */}
      <div className="mb-4 grid gap-4 md:grid-cols-12 lg:grid-cols-2">
        <div className="col-span-4 md:col-span-6 lg:col-span-1 overflow-x-auto">
          <ProductivityChart
            productivity={productivity}
            rawApps={rawApps}
            appList={appList}
            lastId={null}
            isLoading={isLoading}
          />
        </div>
        <Card className="col-span-4 md:col-span-4 lg:col-span-1">
          <CardHeader className={"px-2 p-4 md:p-4 lg:p-6"}>
            <CardTitle>Employee Work Hours</CardTitle>
          </CardHeader>
          <CardContent className={"p-2 md:p-4 lg:p-6"}>
            <ScrollArea>
              <TeamWorkHours
                handleTotalChange={handleTotalChange}
                productive={total.productiveHrs}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-4" />
      <div className="mt-6 space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Application List
        </h2>
        <p className="text-sm text-muted-foreground">
          Lists of all applications used by the team.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 sm:grid-cols-1">
          <TeamAppList
            title={"Productive apps"}
            apps={appList.Productive}
            className={"bg-success text-success-foreground"}
          />
          <TeamAppList
            title={"Unproductive apps"}
            apps={appList.Unproductive}
            className={"bg-warning text-warning-foreground"}
          />
          <TeamAppList
            title={"Neutral apps"}
            apps={appList.Neutral}
            className={"bg-muted text-muted-foreground"}
          />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
