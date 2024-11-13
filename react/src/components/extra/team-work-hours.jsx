import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { useDashboardContext } from "@/context/DashboardContextProvider";
import { useEffect, useState } from "react";
import axiosClient from "@/lib/axios-client";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { secondsToHuman } from "@/lib/timehash";
import { Skeleton } from "../ui/skeleton";
import "./../../main.scss";
import { useStateContext } from "@/context/ContextProvider";

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

const getStatusStyle = (status) => {
  switch (status) {
    case "Active":
      return "border-green-600";
    case "Away":
    case "Idle":
    case "Waiting":
      return "border-yellow-400";
    default:
      return "border-none";
  }
};

const isWeekend = (date) => {
  const day = moment(date).day();
  return day === 0 || day === 6;
};

const TeamWorkHours = ({ productive, handleTotalChange }) => {
  const { date } = useDashboardContext();
  const { currentTeam, setEmployees } = useStateContext();
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState({
    productiveHrs: 0,
    late: 0,
    absent: 0,
    present: 0,
  });

  useEffect(
    () => handleTotalChange(total),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [total]
  );

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get(
        `/dashboard/workhrs/${moment(date).format("YYYY-MM-DD")}/${currentTeam}`
      )
      .then(({ data }) => {
        setLoading(false);
        let empIds = [];
        let emps = [];
        let items = data.data.map((item) => {
          if (!empIds.includes(item.employee.id)) {
            empIds.push(item.employee.id);
            emps.push(item.employee);
          }
          return {
            id: uuidv4(),
            duration: getWorkDuration(item),
            ...item,
          };
        });

        setEmployees(emps);
        return {
          empIds: empIds,
          items,
          overallCount: data.total,
        };
      })
      .then(({ items, empIds, overallCount }) => {
        setWorkLogs(items);
        setTotal({
          productiveHrs: productive,
          late: 0,
          absent: isWeekend(date) ? 0 : overallCount - empIds.length,
          present: empIds.length,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, currentTeam]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWorkLogs(
        workLogs.map((item) => {
          if (
            moment(item.datein).isSame(moment(), "day") &&
            item.timeout === null
          ) {
            return {
              ...item,
              duration: getWorkDuration(item),
            };
          }
          return item;
        })
      );
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <div className="space-y-8 h-[18rem]">
      {!loading && workLogs.length === 0 && "No data"}
      {!loading
        ? workLogs.map((item) => (
          <div key={item.id} className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={`avatar ${item.employee.active_status.toLowerCase()}`}
                  >
                    <Avatar
                      className={`h-9 w-9 border-2 ${getStatusStyle(
                        item.employee.active_status
                      )}`}
                    >
                      <AvatarImage
                        // src={`/images/${item.userid}.png`}
                        src={`${import.meta.env.VITE_BASE_IMG_URL
                          }/api/employees/image/${item.employee.id}`}
                        alt="Avatar"
                      />
                      <AvatarFallback>
                        {item.employee.first_name[0]}
                        {item.employee.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.employee.active_status}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {item.employee.last_name} {item.employee.first_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.employee.email}
              </p>
            </div>
            <div className="ml-auto font-medium">{item.duration}</div>
          </div>
        ))
        : [...Array(10)].map((__, index) => (
          <div key={index} className="flex items-center">
            <Skeleton className="h-9 w-9 border-2 rounded-full" />
            <div className="ml-4 space-y-1">
              <Skeleton className="w-[180px] h-[25px] bg-slate-200" />
              <Skeleton className="w-[140px] h-[20px] bg-slate-200" />
            </div>
            <Skeleton className="ml-auto w-[100px] h-[28px] bg-slate-200" />
          </div>
        ))}
    </div>
  );
};

export default TeamWorkHours;
