/* eslint-disable no-unused-vars */
import axiosClient from "./lib/axios-client";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
// import { useQuery } from "@tanstack/react-query";

import { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { TeamAppList } from "./components/extra/team-app-list";
import { DatePicker } from "./components/extra/date-picker";

import ActivityChart from "./components/ActivityChart";
import SelectDialog from "./components/extra/employee-select-dialog";
import Widget from "./components/extra/widget";

import { CandleData, handleAllocateTime, secondsToHuman } from "./lib/timehash";
import { useDashboardContext } from "@/context/DashboardContextProvider";
import { useParams } from "react-router-dom";
import { useStateContext } from "./context/ContextProvider";
import ProductivityChart from "./components/ProductivityChart";

const CATEGORY = ["Unproductive", "Productive", "Neutral"];

const getWorkDuration = (data) => {
  if (!moment(data.datein).isSame(moment(), "day") && data.timeout === null) {
    return "No timeout!";
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

const ActivityTracking = () => {
  const { date } = useDashboardContext();
  const { currentTeam } = useStateContext();
  const idParameter = useParams().empId;
  const [productivity, setProductivity] = useState([]);
  const [rawApps, setRawApps] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [empId, setEmpId] = useState(idParameter);
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState({
    Productive: [],
    Unproductive: [],
    Neutral: [],
  });
  const [summary, setSummary] = useState({
    productive: "–– ––",
    unproductive: "–– ––",
    neutral: "–– ––",
    idle: "–– ––",
  });
  const [arrival, setArrival] = useState("--:--");
  const [duty, setDuty] = useState("--:--");

  const handleEmployeeChange = (id) => {
    setEmpId(id);
  };

  useEffect(() => {
    axiosClient
      .get(`/employees/team/status/${currentTeam}`)
      .then(({ data }) => setEmployees(data.data))
      .catch((err) => console.log(err));
  }, [currentTeam]);

  useEffect(() => {
    if (!empId) return;
    setLoading(true);
    axiosClient
      .get(
        `/activity/time-log/${empId ?? "0"}/${moment(date).format(
          "YYYY-MM-DD"
        )}`
      )
      .then(({ data }) => data.data)
      .then((resp) => {
        let convert = getWorkDuration(resp);
        let tmpArrival = resp?.timein ? moment(resp?.timein, 'HH:mm:ss').format('HH:mm') : "--:--";
        setArrival(tmpArrival);
        setDuty(convert);
      });

    axiosClient
      .get(`/activity/employee/${empId}/${moment(date).format("YYYY-MM-DD")}`)
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
        let { clonedSticks, activity } = handleAllocateTime(
          data.data,
          cleanCandle
        );
        setSummary({
          productive: activity.working,
          idle: activity.idle,
        });

        const idleApps = [
          "Windows Default Lock Screen",
          "Task Switching",
          "Desktop",
        ];
        await data.data.forEach((app) => {
          if (app.end_time === null || idleApps.includes(app.description))
            return;
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
              abbreviation: app.category.abbreviation,
              totalTime: totalTime,
              icon: app.category.icon,
            });
            tmp.push(app.category.header_name);
          }
        });

        setProductivity(clonedSticks);
        setApps(listApps);

        // Calculate total unproductive time and update the summary state
        let unproductiveTime = listApps.Unproductive.reduce(
          (total, app) => total + app.totalTime,
          0
        );
        let neutralTime = listApps.Neutral.reduce(
          (total, app) => total + app.totalTime,
          0
        );
        setSummary((prevSummary) => ({
          ...prevSummary,
          unproductive: secondsToHuman(unproductiveTime),
          neutral: secondsToHuman(neutralTime),
        }));
      })
      .then(() => setLoading(false))
      .catch((err) => console.log(err));
  }, [date, empId]);

  return (
    <div className="h-full px-4 py-6 lg:px-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          <SelectDialog
            onEmployeeChanged={handleEmployeeChange}
            data={employees}
            selectedId={empId}
          />
        </h2>
        <div className="flex items-center space-x-2">
          <DatePicker />
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4 col">
            <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-1 gap-4">
              <div className="col-span-1">
                <ActivityChart
                  isLoading={loading}
                  productivity={productivity}
                  rawApps={rawApps}
                  empId={empId}
                />
                {/* <ProductivityChart /> */}
              </div>
              <div className="col-span-1">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <Widget
                      loading={loading}
                      title={"Arrival time"}
                      content={arrival}
                    />
                  </div>
                  <div className="col-span-1">
                    <Widget
                      loading={loading}
                      title={"Productive time"}
                      content={summary.productive}
                    />
                  </div>
                  <div className="col-span-1">
                    <Widget
                      loading={loading}
                      title={"Time at work"}
                      content={duty}
                    />
                  </div>
                  <div className="col-span-1">
                    <Widget
                      loading={loading}
                      title={"Unproductive"}
                      content={summary.unproductive}
                    />
                  </div>
                  <div className="col-span-1">
                    <Widget
                      loading={loading}
                      title={"Neutral Time"}
                      content={summary.neutral}
                    />
                  </div>
                  <div className="col-span-1">
                    <Widget
                      loading={loading}
                      title={"Idle time"}
                      content={summary.idle}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
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
        <ScrollArea>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <TeamAppList
                title={"Productive apps"}
                apps={apps.Productive}
                className={"bg-success text-success-foreground"}
                empId={empId}
              />
            </div>
            <div className="col-span-1">
              <TeamAppList
                title={"Unproductive apps"}
                apps={apps.Unproductive}
                className={"bg-warning text-warning-foreground"}
                empId={empId}
              />
            </div>
            <div className="col-span-1">
              <TeamAppList
                title={"Neutral apps"}
                apps={apps.Neutral}
                className={"bg-muted text-muted-foreground"}
                empId={empId}
              />
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default ActivityTracking;
