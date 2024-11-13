import {
  useCallback,
  useMemo,
  useState,
  createContext,
  useEffect,
} from "react";

import { columns } from "@/components/extra/utilization/columns";
import { DataTable } from "@/components/extra/utilization/data-table";
import { v4 as uuidv4 } from "uuid";
import axiosClient from "./lib/axios-client";
import moment from "moment";
import { useDashboardContext } from "@/context/DashboardContextProvider";
import { useQuery } from "@tanstack/react-query";
// import { getLastActivity } from "./Employees";
import { useStateContext } from "./context/ContextProvider";

const CUTOFF_TIME = moment("12:00:00", "HH:mm");

const PaginationContext = createContext(10);

const Utilization = () => {
  const { date } = useDashboardContext();
  const { currentTeam } = useStateContext();

  function rand(min, max) {
    let decimal = Math.random();
    return parseFloat(
      Math.floor(Math.random() * (max - min + 1)) + min + decimal
    ).toFixed(2);
  }

  const getDayStatus = useCallback(
    (dayOfWeek) => {
      let now = moment().day();
      if (moment(date).year() > moment().year()) return;

      if (moment(date).week() > moment().week()) return;

      if (dayOfWeek < now) return "Absent";

      return null;
    },
    [date]
  );

  const [pagination, setPagination] = useState(PaginationContext);

  const dailyAttendance = (data) => {
    if (data.productivity === "pending") return "Pending";
    let { productive_duration, neutral_duration } = data.productivity;

    return parseFloat((productive_duration + neutral_duration) / 3600).toFixed(
      2
    );
  };

  const { data, isLoading } = useQuery({
    queryKey: ["utilization", date, currentTeam],
    queryFn: () =>
      axiosClient
        .get(
          `/utilization/weekly/${moment(date).format(
            "YYYY-MM-DD"
          )}/${currentTeam}`
        )
        .then(({ data }) => {
          let formatData = [];
          data.employees.forEach((emp) => {
            let filterByEmployee = data.data.filter(
              (item) => parseInt(item.userid) === emp.id
            );
            formatData.push({
              id: uuidv4(),
              employee: {
                id: emp.id,
                first: emp.first_name,
                last: emp.last_name,
              },
              name: `${emp.last_name}, ${emp.first_name}`,
              status: emp.active_status,
              // name: `${emp.first_name} ${emp.last_name}`,
              // firstName: emp.first_name,
              // lastName: emp.last_name,
              // status: emp.active_status,
              // online: getLastActivity(emp.last_activity),
              attendance: filterByEmployee,
              holidays: ["2024-01-01"],
            });
          });
          return formatData;
        })
        .then((raw) => {
          let formData = [];
          raw.forEach((item) => {
            let days = {
              sunday: "Restday",
              monday: getDayStatus(1),
              tuesday: getDayStatus(2),
              wednesday: getDayStatus(3),
              thursday: getDayStatus(4),
              friday: getDayStatus(5),
              saturday: "Restday",
            };

            item.attendance.forEach((att) => {
              let day = moment(att.datein).format("dddd");
              days = { ...days, [day.toLowerCase()]: dailyAttendance(att) };
            });

            if (item.holidays.length > 0) {
              item.holidays.forEach((holiday) => {
                let holidayDate = moment(holiday).format("dddd");
                if (moment(holiday).isSame(moment(date), "week")) {
                  days = { ...days, [holidayDate.toLowerCase()]: "Holiday" };
                }
              });
            }

            delete item.attendance;
            delete item.holidays;
            formData.push({ ...item, ...days });
          });
          return formData;
        }),
    // enabled: !isFetched,
  });

  const memoizedCols = useMemo(columns, []);

  useEffect(() => {
    setPagination(PaginationContext);
  }, []);

  // console.log(data, "data");

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      {!isLoading && (
        <PaginationContext.Provider value={pagination}>
          <DataTable data={data} columns={memoizedCols} />
        </PaginationContext.Provider>
      )}
    </div>
  );
};

export default Utilization;
