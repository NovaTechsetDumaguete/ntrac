import { useEffect, useRef, useState } from "react";
import { useDashboardContext } from "@/context/DashboardContextProvider";
// import ActivityChart from "./components/ActivityChart";
import ProductivityChart from "./components/ProductivityChart";
import axiosClient from "@/lib/axios-client";

import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

import { handleAllocateTime, CandleData, secondsToHuman } from "./lib/timehash";

import { TeamAppList } from "./components/extra/team-app-list";
import { DatePicker } from "./components/extra/date-picker";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./components/ui/card";
import TeamWorkHours from "./components/extra/team-work-hours";
import { Skeleton } from "./components/ui/skeleton";
import { useStateContext } from "./context/ContextProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { Button } from "./components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./components/ui/calendar";
import { cn } from "./lib/utils";
import { format } from "date-fns";
import ChartComponent from "./components/UserProductivityChart";
import UserProductivityChart from "./components/UserProductivityChart";
import { data } from "autoprefixer";
import UserTransactions from "./components/extra/UserTransactions";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
const CATEGORY = ["Unproductive", "Productive", "Neutral"];

function Dashboard() {
  // const { date } = useDashboardContext();
  // const { currentTeam } = useStateContext();
  const [userid, setuserid] = useState(localStorage.getItem("USERID"));
  // const [productivity, setProductivity] = useState([]);
  // const [rawApps, setRawApps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [appList, setAppList] = useState({
    Productive: [],
    Unproductive: [],
    Neutral: [],
  });

  const [appData, setappData] = useState([]);

  const [total, setTotal] = useState({
    productiveHrs: "No Data",
    unproductiveHrs: "No Data",
    neutralHrs: "No Data",
    nfHrs: "No Data",
    omHrs: "No Data",
    idle: "No Data",
    late: 0,
    absent: 0,
    present: 0,
  });

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
  const formatDateForAPI = (date) => {
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-PH", options);

    const [month, day, year] = formatter.format(date).split("/");
    return `${year}-${month}-${day}`; // Format as yyyy-MM-dd
  };
  useEffect(() => {
    // let tmpTotal = { ...total };
    // let productiveHrs = 0;
    // let unproductiveHrs = 0;
    // let neutralHrs = 0;
    // appList.Productive.forEach((app) => {
    //   productiveHrs += app.totalTime;
    // });
    // appList.Unproductive.forEach((app) => {
    //   unproductiveHrs += app.totalTime;
    // });
    // appList.Neutral.forEach((app) => {
    //   neutralHrs += app.totalTime;
    // });
    // console.log("productiveHrs: ", productiveHrs);
    // console.log("unproductiveHrs: ", unproductiveHrs);
    // console.log("neutralHrs: ", neutralHrs);
    // console.log("productiveHrs: ", formatTime(productiveHrs));
    // console.log("unproductiveHrs: ", formatTime(unproductiveHrs));
    // console.log("neutralHrs: ", formatTime(neutralHrs));
    // setTotal({ ...tmpTotal, productiveHrs: formatTime(productiveHrs) });
    // setTotal({ ...tmpTotal, unproductiveHrs: formatTime(unproductiveHrs) });
    // setTotal({ ...tmpTotal, neutralHrs: formatTime(neutralHrs) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appList.Productive, userid]);

  const [summary, setSummary] = useState({
    productive: "–– ––",
    unproductive: "–– ––",
    neutral: "–– ––",
    idle: "–– ––",
  });

  const [rawApps, setRawApps] = useState([]);
  const handleFetchData = async (datevalue) => {
    setIsLoading(true);

    // Reset totals
    setTotal({
      ...total,
      productiveHrs: "0s",
      unproductiveHrs: "0s",
      neutralHrs: "0s",
      nfHrs: "0s",
      omHrs: "0s",
      idle: "0s",
    });

    // Reset appList
    setAppList({
      ...appList,
      Productive: [],
      Unproductive: [],
      Neutral: [],
    });

    if (!userid) {
      console.error("UserID is required.");
      setIsLoading(false);
      return;
    }

    const date = new Date();
    // const formattedDate = new Date(datevalue).toISOString().split("T")[0];
    const userIdAsInteger = parseInt(userid, 10);

    console.log("userIdAsInteger: ", userIdAsInteger);
    // console.log("datevalue: ", formatToPhilippineTime(date));
    console.log("datevalue: ", formatDateForAPI(datevalue));

    try {
      const response = await axiosClient.get("/tracking/apps/userdata", {
        params: {
          userid: userIdAsInteger,
          date: formatDateForAPI(datevalue),
        },
      });

      const { data } = response;
      console.log("data: ", data);

      const { productive, unproductive, neutral } = response.data.data;

      // Flatten all the nested arrays into one array
      const productiveFlattened = productive.flat();
      const unproductiveFlattened = unproductive.flat();
      const neutralFlattened = neutral.flat();

      const omList = data.standbylist
        .filter((item) => item.description === "OM")
        .map(({ start_time, ...rest }) => ({
          ...rest,
          time: start_time, // Rename start_time to time
        }));

      const nfList = data.standbylist
        .filter((item) => item.description === "NF")
        .map(({ start_time, ...rest }) => ({
          ...rest,
          time: start_time, // Rename start_time to time
        }));

      let productiveHrs = 0;
      let unproductiveHrs = 0;
      let neutralHrs = 0;
      let nfHrs = 0;
      let omHrs = 0;

      let highestEndTime = null;
      let lowestStartTime = null;

      const updateTimes = (start, end) => {
        const startTime = moment(start, "HH:mm:ss");
        const endTime = moment(end, "HH:mm:ss");

        if (!lowestStartTime || startTime.isBefore(lowestStartTime)) {
          lowestStartTime = startTime;
        }
        if (!highestEndTime || endTime.isAfter(highestEndTime)) {
          highestEndTime = endTime;
        }
      };

      data.data.productive.forEach((app) => {
        productiveHrs += app.duration;
        updateTimes(app.time, app.end_time);
      });
      data.data.unproductive.forEach((app) => {
        unproductiveHrs += app.duration;
        updateTimes(app.time, app.end_time);
      });
      data.data.neutral.forEach((app) => {
        neutralHrs += app.duration;
        updateTimes(app.time, app.end_time);
      });
      data.standbylist.forEach((app) => {
        updateTimes(app.start_time, app.end_time);
        if (app.description === "OM") {
          nfHrs += app.duration;
        } else {
          omHrs += app.duration;
        }
      });

      setappData({
        productive: productiveFlattened,
        unproductive: unproductiveFlattened,
        neutral: neutralFlattened,
        om: omList, // OM category from standbylist
        nf: nfList, // NF category from standbylist
      });

      let totalidle = 0;
      if (lowestStartTime && highestEndTime) {
        const duration = moment.duration(highestEndTime.diff(lowestStartTime));
        let totalSeconds = duration.asSeconds();

        totalidle =
          totalSeconds -
          (productiveHrs + unproductiveHrs + neutralHrs + nfHrs + omHrs);

        console.log("Total Seconds:", totalSeconds);
        console.log("Total Idle:", totalidle);
        console.log("Total Idle:", formatTime(totalidle));
      } else {
        console.log("Insufficient data to calculate total seconds.");
      }
      console.log("Lowest Start Time:", lowestStartTime);
      console.log("Highest End Time:", highestEndTime);
      console.log("productiveHrs (formatted): ", formatTime(productiveHrs));
      console.log("unproductiveHrs (formatted): ", formatTime(unproductiveHrs));
      console.log("neutralHrs (formatted): ", formatTime(neutralHrs));
      console.log("nfHrs (formatted): ", formatTime(nfHrs));
      console.log("omHrs (formatted): ", formatTime(omHrs));

      setTotal({
        ...total,
        productiveHrs: formatTime(productiveHrs),
        unproductiveHrs: formatTime(unproductiveHrs),
        neutralHrs: formatTime(neutralHrs),
        nfHrs: formatTime(nfHrs),
        omHrs: formatTime(omHrs),
        idle: formatTime(totalidle),
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const { date, setDate } = useDashboardContext();
  const btnRef = useRef(null);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    // btnRef.current.click();
    console.log("newDate: ", newDate);
    handleFetchData(newDate);
  };
  useEffect(() => {
    handleFetchData(date);
  }, [date, userid]);
  // App Listing
  // useEffect(() => {
  //   setIsLoading(true);
  //   // setProductivity([]);
  //   // setRawApps([]);
  //   setTotal({
  //     ...total,
  //     productiveHrs: "0s",
  //     unproductiveHrs: "0s",
  //     neutralHrs: "0s",
  //   });

  //   // Reset appList
  //   setAppList({
  //     ...appList,
  //     Productive: [],
  //     Unproductive: [],
  //     Neutral: [],
  //   });
  //   if (!userid) return;
  //   console.log("userid: ", userid);
  //   console.log("date: ", date);

  //   const formattedDate = new Date(date).toISOString().split("T")[0];
  //   const userIdAsInteger = parseInt(userid, 10);
  //   console.log("userIdAsInteger: ", userIdAsInteger);
  //   console.log("formattedDate: ", formattedDate);
  //   axiosClient
  //     .get("/tracking/apps/data", {
  //       params: {
  //         userid: userIdAsInteger,
  //         date: formattedDate,
  //       },
  //     })
  //     .then(async ({ data }) => {
  //       console.log("data: ", data.data);

  //       // let listApps = {
  //       //   Productive: [],
  //       //   Unproductive: [],
  //       //   Neutral: [],
  //       // };
  //       // let tmp = [];
  //       // setRawApps(data.data);
  //       // let dataLength = data.data.length;
  //       // let cleanCandle = CandleData(
  //       //   data.data[0]?.time,
  //       //   data.data[dataLength - 1]?.time,
  //       //   date
  //       // ).map((candle) => {
  //       //   return {
  //       //     label: candle,
  //       //     value: 0,
  //       //     category: { productive: 0, unproductive: 0, neutral: 0 },
  //       //   };
  //       // });

  //       // if (data.data.length === 1) return;
  //       // let { clonedSticks } = handleAllocateTime(data.data, cleanCandle);

  //       // await data.data.forEach((app) => {
  //       //   if (app.end_time === null) return;
  //       //   let endTime = moment(app.end_time, "H:mm:ss");
  //       //   let startTime = moment(app.time, "H:mm:ss");
  //       //   let totalTime = moment.duration(endTime.diff(startTime)).asSeconds();

  //       //   if (tmp.includes(app.category.header_name)) {
  //       //     let index = listApps[
  //       //       CATEGORY[app.category.is_productive]
  //       //     ].findIndex((x) => {
  //       //       return x.name === app.category.header_name;
  //       //     });
  //       //     listApps[CATEGORY[app.category.is_productive]][index].totalTime +=
  //       //       totalTime;
  //       //   } else {
  //       //     listApps[CATEGORY[app.category.is_productive]].push({
  //       //       id: uuidv4(),
  //       //       name: app.category.header_name,
  //       //       totalTime: totalTime,
  //       //       abbreviation: app.category.abbreviation,
  //       //       icon: app.category.icon,
  //       //     });
  //       //     tmp.push(app.category.header_name);
  //       //   }
  //       // });

  //       // setProductivity(clonedSticks);
  //       // setAppList(listApps);
  //       let productiveHrs = 0;
  //       let unproductiveHrs = 0;
  //       let neutralHrs = 0;
  //       data.data.productive.forEach((app) => {
  //         productiveHrs += app.duration;
  //       });
  //       data.data.unproductive.forEach((app) => {
  //         unproductiveHrs += app.duration;
  //       });
  //       data.data.neutral.forEach((app) => {
  //         neutralHrs += app.duration;
  //       });
  //       console.log("productiveHrs: ", productiveHrs);
  //       console.log("unproductiveHrs: ", unproductiveHrs);
  //       console.log("neutralHrs: ", neutralHrs);

  //       console.log("productiveHrs: ", formatTime(productiveHrs));
  //       console.log("unproductiveHrs: ", formatTime(unproductiveHrs));
  //       console.log("neutralHrs: ", formatTime(neutralHrs));

  //       let tmpTotal = { ...total };
  //       setTotal({
  //         ...tmpTotal,
  //         productiveHrs: formatTime(productiveHrs),
  //         unproductiveHrs: formatTime(unproductiveHrs),
  //         neutralHrs: formatTime(neutralHrs),
  //       });
  //       // console.log("listApps: ", listApps);
  //     })
  //     .then(() => setIsLoading(false));
  // }, [date, userid]);

  const handleTotalChange = (newTotal) => {
    setTotal(newTotal);
  };

  return (
    <>
      <div className="flex flex-wrap items-center md:justify-between md:flex-nowrap space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold md:text-2xl">User Dashboard</h2>
        </div>
        <div className="shrink ml-auto md:ml-auto lg:ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                ref={btnRef}
                variant={"outline"}
                className={cn(
                  "max-w-64 justify-start text-left  font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productive Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">
              {!isLoading ? (
                <span>{total.productiveHrs}</span>
              ) : (
                <Skeleton className="w-[140px] h-[32px] bg-slate-200" />
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 640 512"
            >
              <path d="M184 48H328c4.4 0 8 3.6 8 8V96H176V56c0-4.4 3.6-8 8-8zm-56 8V96H64C28.7 96 0 124.7 0 160v96H192 352h8.2c32.3-39.1 81.1-64 135.8-64c5.4 0 10.7 .2 16 .7V160c0-35.3-28.7-64-64-64H384V56c0-30.9-25.1-56-56-56H184c-30.9 0-56 25.1-56 56zM320 352H224c-17.7 0-32-14.3-32-32V288H0V416c0 35.3 28.7 64 64 64H360.2C335.1 449.6 320 410.5 320 368c0-5.4 .2-10.7 .7-16l-.7 0zm320 16a144 144 0 1 0 -288 0 144 144 0 1 0 288 0zM496 288c8.8 0 16 7.2 16 16v48h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H496c-8.8 0-16-7.2-16-16V304c0-8.8 7.2-16 16-16z" />
            </svg>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neutral</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">
              {!isLoading ? (
                <span>{total.neutralHrs}</span>
              ) : (
                <Skeleton className="w-[140px] h-[32px] bg-slate-200" />
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 384 512"
            >
              <path d="M0 24C0 10.7 10.7 0 24 0H360c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V67c0 40.3-16 79-44.5 107.5L225.9 256l81.5 81.5C336 366 352 404.7 352 445v19h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H24c-13.3 0-24-10.7-24-24s10.7-24 24-24h8V445c0-40.3 16-79 44.5-107.5L158.1 256 76.5 174.5C48 146 32 107.3 32 67V48H24C10.7 48 0 37.3 0 24zM110.5 371.5c-3.9 3.9-7.5 8.1-10.7 12.5H284.2c-3.2-4.4-6.8-8.6-10.7-12.5L192 289.9l-81.5 81.5zM284.2 128C297 110.4 304 89 304 67V48H80V67c0 22.1 7 43.4 19.8 61H284.2z" />
            </svg>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unproductive</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">
              {!isLoading ? (
                <span>{total.unproductiveHrs}</span>
              ) : (
                <Skeleton className="w-[140px] h-[32px] bg-slate-200" />
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 640 512"
            >
              <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L381.9 274c48.5-23.2 82.1-72.7 82.1-130C464 64.5 399.5 0 320 0C250.4 0 192.4 49.3 178.9 114.9L38.8 5.1zM545.5 512H528L284.3 320h-59C136.2 320 64 392.2 64 481.3c0 17 13.8 30.7 30.7 30.7H545.3l.3 0z" />
            </svg>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idle</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">
              {!isLoading ? (
                <span>{total.idle}</span>
              ) : (
                <Skeleton className="w-[140px] h-[32px] bg-slate-200" />
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 640 512"
            >
              <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM625 177L497 305c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L591 143c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
            </svg>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Files</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">
              {" "}
              {!isLoading ? (
                <span>{total.nfHrs}</span>
              ) : (
                <Skeleton className="w-[140px] h-[32px] bg-slate-200" />
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 640 512"
            >
              <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM625 177L497 305c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L591 143c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
            </svg>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Meeting</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <div className="text-2xl font-bold">
              {" "}
              {!isLoading ? (
                <span>{total.omHrs}</span>
              ) : (
                <Skeleton className="w-[140px] h-[32px] bg-slate-200" />
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32"
              width="40"
              viewBox="0 0 640 512"
            >
              <path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM625 177L497 305c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L591 143c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
            </svg>
          </CardContent>
        </Card>
      </div>
      {/* Adjust here */}
      <div className="mb-4 grid gap-4 md:grid-cols-12 lg:grid-cols-2">
        <div className="col-span-4 md:col-span-5 lg:col-span-1 overflow-x-auto">
          <UserProductivityChart dataraw={appData} />
        </div>
        <Card className="col-span-5 md:col-span-5 lg:col-span-1">
          <CardHeader>
            <CardTitle>Apps</CardTitle>
          </CardHeader>
          <CardContent className={"px-4 md:px-4 lg:px-4 col-span-5"}>
            <ScrollArea>
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="sticky top-0 z-10 w-auto max-w-[500px] flex space-x-2 justify-start">
                  <TabsTrigger value="productive">Productive</TabsTrigger>
                  <TabsTrigger value="unproductive">Unproductive</TabsTrigger>
                  <TabsTrigger value="neutral">Neutral</TabsTrigger>
                  <TabsTrigger value="nf">No Files</TabsTrigger>
                  <TabsTrigger value="om">On Meeting</TabsTrigger>
                </TabsList>
                <TabsContent value="productive">
                  <UserTransactions
                    data={appData.productive}
                    type="PRODUCTIVE"
                  />
                </TabsContent>
                <TabsContent value="unproductive">
                  <UserTransactions
                    data={appData.unproductive}
                    type="UNPRODUCTIVE"
                  />
                </TabsContent>
                <TabsContent value="neutral">
                  <UserTransactions data={appData.neutral} type="NEUTRAL" />
                </TabsContent>
                <TabsContent value="nf">
                  <UserTransactions data={appData.nf} type="NF" />
                </TabsContent>
                <TabsContent value="om">
                  <UserTransactions data={appData.om} type="OM" />
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Dashboard;
