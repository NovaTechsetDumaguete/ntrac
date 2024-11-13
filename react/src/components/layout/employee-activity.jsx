import { useState } from "react";
import ActivityChart from "../ActivityChart";
import Widget from "../extra/widget";
import { useQuery } from "@tanstack/react-query";
import axiosClient, { axiosClientDev } from "@/lib/axios-client";
import { handleAllocateTime } from "@/lib/timehash";
import moment from "moment";
import { useParams } from "react-router-dom";
import { useDashboardContext } from "@/context/DashboardContextProvider";

const EmployeeActivity = () => {
  const empId = useParams().empId;
  const [rawApps, setRawApps] = useState([]);
  const { date } = useDashboardContext();
  // const [activityArray, setActivityArray] = useState([]);
  const [arrival, setArrival] = useState("--:--");
  const [duty, setDuty] = useState("--:--");
  const [summary, setSummary] = useState({
    productive: "–– ––",
    idle: "–– ––",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () =>
      axiosClientDev
        .get(`/activity/employee/${empId}/${moment(date).format("YYYY-MM-DD")}`)
        .then(({ data }) => {
          setRawApps(data.data);
        }),
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-1">
        <ActivityChart productivity={data} rawApps={rawApps} />
      </div>
      <div className="col-span-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <Widget
              loading={isLoading}
              title={"Arrival time"}
              content={arrival}
            />
          </div>
          <div className="col-span-1">
            <Widget loading={isLoading} title={"Time at work"} content={duty} />
          </div>
          <div className="col-span-1">
            <Widget
              loading={isLoading}
              title={"Productive time"}
              content={summary.productive}
            />
          </div>
          <div className="col-span-1">
            <Widget
              loading={isLoading}
              title={"Idle time"}
              content={summary.idle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeActivity;
