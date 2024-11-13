import { createContext, useContext, useState } from "react";
import { newDate } from "@/assets/utils";
import moment from "moment";

const DashboardContext = createContext({
  date: moment(),
  setDate: () => {},
  employeeId: 0,
  setEmployeeId: () => {},
});

export const DashboardContextProvider = ({ children }) => {
  const [date, setDate] = useState(newDate());
  const [employeeId, setEmployeeId] = useState(0);

  return (
    <DashboardContext.Provider
      value={{
        date,
        setDate,
        employeeId,
        setEmployeeId,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => useContext(DashboardContext);
