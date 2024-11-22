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
import UserApproval from "./UserApproval";
import Report from "./Report";
import Categorization from "./Categorization";
import Utilization from "./Utilization";
import UserLogin from "./views/UserLogin";
import UserDashboard from "./UserDashboard";

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
        element: <Attendance />,
      },
      {
        path: "/attendance",
        element: <Attendance />,
      },
      {
        path: "/user-approval",
        element: <UserApproval />,
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
      {
        path: "/userdashboard",
        element: <UserDashboard />,
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
      {
        path: "/userlogin",
        element: <UserLogin />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
