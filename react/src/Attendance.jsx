import {
  useCallback,
  useMemo,
  useState,
  createContext,
  useEffect,
} from "react";
import { columns } from "@/components/extra/attendance/columns";
import { DataTable } from "@/components/extra/attendance/data-table";
import { v4 as uuidv4 } from "uuid";
import axiosClient from "./lib/axios-client";
import moment from "moment";
import { useDashboardContext } from "@/context/DashboardContextProvider";
import { useQuery } from "@tanstack/react-query";
import { getLastActivity } from "./Employees";
import { useStateContext } from "./context/ContextProvider";

const CUTOFF_TIME = moment("12:00:00", "HH:mm");

const PaginationContext = createContext(5);

const Attendance = () => {
  const { date } = useDashboardContext();
  const { currentTeam } = useStateContext();

  const getDayStatus = useCallback(
    (dayOfWeek) => {
      let now = moment().day();
      return dayOfWeek < now ||
        moment(date).week() < moment().week() ||
        moment(date).year() < moment().year()
        ? "Absent"
        : null;
    },
    [date]
  );

  const [pagination, setPagination] = useState(PaginationContext);

  const dailyAttendance = (data) => {
    if (moment(data.timein, "HH:mm").isAfter(CUTOFF_TIME)) {
      return "Late";
    }
    return "Present";
  };

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", date, currentTeam],
    queryFn: () =>
      axiosClient
        .get(
          `/attendance/weekly/${moment(date).format(
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
              employeeId: emp.id,
              name: `${emp.first_name} ${emp.last_name}`,
              firstName: emp.first_name,
              lastName: emp.last_name,
              status: emp.active_status,
              online: getLastActivity(emp.last_activity),
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

export default Attendance;
