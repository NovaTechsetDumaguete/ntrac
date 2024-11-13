import { Navigate, createBrowserRouter } from "react-router-dom";

import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import Signup from "./views/Signup";
import Dashboard from "./Dashboard.jsx";
import Employees from "./Employees.jsx";
import ActivityTracking from "./ActivityTracking";
import Attendance from "./Attendance";
import TransactionApproval from "./TransactionApproval";
import Report from "./Report";
import Categorization from "./Categorization";
import Utilization from "./Utilization";
//import { DashboardBlock } from "./DashboardBlock";
import Teams from "./Teams";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
        // element: <DashboardBlock />
      },
      {
        path: "/employees",
        element: <Employees />,
      },
      {
        path: "/activity-tracking/:empId",
        element: <ActivityTracking />,
      },
      {
        path: "/activity-tracking",
        element: <ActivityTracking />,
      },
      {
        path: "/teams",
        element: <Teams />,
      },
      {
        path: "/attendance",
        element: <Attendance />,
      },
      {
        path: "/transaction-approval",
        element: <TransactionApproval />,
      },
      {
        path: "/categorization",
        element: <Categorization />,
      },
      {
        path: "/utilization",
        element: <Utilization />,
      },
      {
        path: "/reports",
        element: <Report />,
      },
    ],
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
