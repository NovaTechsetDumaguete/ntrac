import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button, buttonVariants } from "@ui/button";
import { Badge } from "@ui/badge";
import { Separator } from "@ui/separator";

import { BarChartIcon, LayersIcon } from "@radix-ui/react-icons";
import { TeamSwitcher } from "../layout/team-switcher";

export function UserSidebar({ className, open, setOpen }) {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation
  const [currentRoute, setCurrentRoute] = useState("");
  // const [isCollapsed, setIsCollapsed] = useState(false);
  const isCollapsed = false;

  const handleOnClick = () => {
    if (open) {
      setOpen(false);
    }
  };
  const [localdash, setloaddash] = useState(false);

  useEffect(() => {
    console.log("Current Route:", location.pathname);
    setCurrentRoute(location.pathname);
    // Check if already navigated to user dashboard
    if (localStorage.getItem("USERTYPE") === "USER" && !localdash) {
      setloaddash(true); // Ensure it only runs once
      navigate("/userdashboard", { replace: true }); // Use replace to prevent navigating back
    }
  }, [location.pathname, localdash, navigate]); // Ensure dependencies are correct

  const navItems = [
    {
      name: "Dashboard",
      href: "/userdashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4"
        >
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ),
    },
    // {
    //   name: "Tracking",
    //   href: "/activity-tracking",
    //   icon: (
    //     <svg
    //       width="25"
    //       height="25"
    //       viewBox="0 0 15 15"
    //       fill="none"
    //       xmlns="http://www.w3.org/2000/svg"
    //       className="mr-2 h-4 w-4"
    //     >
    //       <path
    //         d="M5.49998 0.5C5.49998 0.223858 5.72383 0 5.99998 0H7.49998H8.99998C9.27612 0 9.49998 0.223858 9.49998 0.5C9.49998 0.776142 9.27612 1 8.99998 1H7.99998V2.11922C9.09832 2.20409 10.119 2.56622 10.992 3.13572C11.0116 3.10851 11.0336 3.08252 11.058 3.05806L11.858 2.25806C12.1021 2.01398 12.4978 2.01398 12.7419 2.25806C12.986 2.50214 12.986 2.89786 12.7419 3.14194L11.967 3.91682C13.1595 5.07925 13.9 6.70314 13.9 8.49998C13.9 12.0346 11.0346 14.9 7.49998 14.9C3.96535 14.9 1.09998 12.0346 1.09998 8.49998C1.09998 5.13362 3.69904 2.3743 6.99998 2.11922V1H5.99998C5.72383 1 5.49998 0.776142 5.49998 0.5ZM2.09998 8.49998C2.09998 5.51764 4.51764 3.09998 7.49998 3.09998C10.4823 3.09998 12.9 5.51764 12.9 8.49998C12.9 11.4823 10.4823 13.9 7.49998 13.9C4.51764 13.9 2.09998 11.4823 2.09998 8.49998ZM7.99998 4.5C7.99998 4.22386 7.77612 4 7.49998 4C7.22383 4 6.99998 4.22386 6.99998 4.5V9.5C6.99998 9.77614 7.22383 10 7.49998 10C7.77612 10 7.99998 9.77614 7.99998 9.5V4.5Z"
    //         fill="currentColor"
    //         fillRule="evenodd"
    //         clipRule="evenodd"
    //       ></path>
    //     </svg>
    //   ),
    // },
    // {
    //   name: "Utilization",
    //   href: "/utilization",
    //   icon: <BarChartIcon className="mr-2 h-4 w-4" />,
    // },
  ];

  return (
    <div className={cn("pb-3", className)}>
      <div className="space-y-4">
        <div className="px-3 py-2">
          <Separator />
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.name} to={item.href}>
                <Button
                  onClick={handleOnClick}
                  variant={
                    currentRoute.includes(item.href) ? "default" : "ghost"
                  }
                  className={cn(
                    buttonVariants({
                      variant: currentRoute.includes(item.href)
                        ? "default"
                        : "ghost",
                      size: "icon",
                    }),
                    "w-full justify-start",
                    currentRoute.includes(item.href) &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  {item.icon}
                  <span
                    className={
                      currentRoute.includes(item.href)
                        ? "font-semibold"
                        : "font-medium"
                    }
                  >
                    {item.name}
                  </span>
                  {item.notif && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {item.notif}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
