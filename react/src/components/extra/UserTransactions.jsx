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

const UserTransactions = ({ data, type }) => {
  const [groupedData, setGroupedData] = useState([]);
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0s"; // Handle invalid or undefined inputs
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let result = [];
    if (hrs > 0) result.push(`${hrs}hr`);
    if (mins > 0) result.push(`${mins}m`);
    if (secs > 0 || result.length === 0) result.push(`${secs}s`);

    return result.join(" ");
  }
  useEffect(() => {
    if (type === "PRODUCTIVE" || type === "UNPRODUCTIVE") {
      if (!Array.isArray(data) || data.length === 0) {
        setGroupedData([]);
        return;
      }

      // Group data by `category.header_name`
      const grouped = {};
      data.forEach((app) => {
        if (!app.end_time || !app.time || !app.category?.header_name) return;

        const endTime = moment(app.end_time, "HH:mm:ss");
        const startTime = moment(app.time, "HH:mm:ss");
        const duration = moment.duration(endTime.diff(startTime)).asSeconds();

        const headerName = app.category.header_name;

        if (!grouped[headerName]) {
          grouped[headerName] = {
            id: uuidv4(),
            name: headerName,
            icon: app.category.icon || "",
            abbreviation: app.category.abbreviation,
            totalDuration: 0,
          };
        }

        grouped[headerName].totalDuration += duration;
      });

      // Convert grouped object to an array// Assuming grouped is the result of grouping data by `header_name`
      const groupedArray = Object.values(grouped);

      // Sort the grouped array by `totalDuration` in descending order
      groupedArray.sort((a, b) => b.totalDuration - a.totalDuration);

      // Set the sorted grouped data to state
      setGroupedData(groupedArray);

      console.log("Object.values(grouped): ", Object.values(grouped));
    } else if (type === "NEUTRAL") {
      if (!Array.isArray(data) || data.length === 0) {
        setGroupedData([]);
        return;
      }

      console.log("neutral: ", data);
      // Group data by `app.name`
      const grouped = {};
      data.forEach((app) => {
        if (!app.end_time || !app.time || !app.description) return;

        const endTime = moment(app.end_time, "HH:mm:ss");
        const startTime = moment(app.time, "HH:mm:ss");
        const duration = moment.duration(endTime.diff(startTime)).asSeconds();

        const appName = app.description; // Grouping by `app.name`

        if (!grouped[appName]) {
          grouped[appName] = {
            id: uuidv4(),
            name: appName, // Use `app.name` instead of `header_name`
            icon: app.category.icon || "", // Use `app.icon` if available
            abbreviation: app.category?.abbreviation || "",
            totalDuration: 0,
          };
        }

        grouped[appName].totalDuration += duration;
      });

      // Convert grouped object to an array
      const groupedArray = Object.values(grouped);

      // Sort the grouped array by `totalDuration` in descending order
      groupedArray.sort((a, b) => b.totalDuration - a.totalDuration);

      // Set the sorted grouped data to state
      setGroupedData(groupedArray);
    } else if (type === "NF" || type === "OM") {
      if (!Array.isArray(data) || data.length === 0) {
        setGroupedData([]);
        return;
      }

      const updatedGroupedArray = data.map((item) => ({
        ...item,
        id: uuidv4(),
        abbreviation: item.description,
        icon: "...",
        totalDuration: item.duration,
        name: item.description === "NF" ? "No Files" : "On Meeting",
      }));

      setGroupedData(updatedGroupedArray);
    }
  }, [data, type]);

  return (
    <div className="space-y-3 h-[18rem]">
      {groupedData.map((item) => (
        <div key={item.id} className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div>
                  {/* <Avatar>
                    <AvatarImage src={item.icon} alt={item.name} />
                    <AvatarFallback>{item.name[0]}</AvatarFallback>
                  </Avatar> */}
                  <Avatar className="flex items-center justify-center">
                    <AvatarImage
                      className="h-6 w-6"
                      src={`/icons/${item.icon}`}
                      alt={item.name}
                    />
                    <AvatarFallback>
                      {item.abbreviation
                        ? item.abbreviation
                        : item.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>{item.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="ml-4 space-y-1">
            {(type === "NF" || type === "OM") && (
              <p className="text-sm font-medium leading-none">
                From: {item.time} To: {item.end_time}
              </p>
            )}
            <p className="text-sm text-muted-foreground">{item.name}</p>
          </div>
          <div className="ml-auto font-medium mr-4">
            {formatTime(item.totalDuration)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserTransactions;
