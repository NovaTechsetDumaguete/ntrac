/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../lib/axios-client.js";

// import Navbar from "./layout/Navbar.jsx";
// import { Sidebar } from "./extra/sidebar";
import { Toaster } from "./ui/sonner";
import BlockLayout from "./BlockLayout";
import UserBlockLayout from "./UserBlockLayout";
// import { echoInstance } from '@/lib/echo';

export default function UserDefaultLayout() {
  const { token, setUser } = useStateContext();
  const location = useLocation();

  useEffect(() => {
    const userType =
      localStorage.getItem("USERTYPE") === "USER" ? "User" : "Admin";
    const pageTitle = location.pathname.split("/")[1] || "Home"; // Default to "Home" if no path
    document.title = `nTrac ${userType} | ${pageTitle}`;
  }, [location]);

  useEffect(() => {
    axiosClient.get("/user").then(({ data }) => {
      setUser(data);
    });
  }, []);

  if (!token) {
    return (
      <Navigate
        to={
          localStorage.getItem("USERTYPE") === "USER" ? "/login" : "/userlogin"
        }
      />
    );
  }

  return (
    <UserBlockLayout>
      <Outlet />
      <Toaster />
    </UserBlockLayout>
  );

  // return (
  //   <div className="md:block">
  //     <Navbar />
  //     <div className="border-t">
  //       <div className="bg-background">
  //         <div className="grid lg:grid-cols-7">
  //           <Sidebar playlists={playlists} className="hidden lg:block" />
  //           <div className="col-span-3 lg:col-span-6 lg:border-l">
  //             <Outlet />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     <Toaster />
  //   </div>
  // );
}
