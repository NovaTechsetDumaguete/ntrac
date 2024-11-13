import { CircleIcon, DownloadIcon } from "@radix-ui/react-icons";

import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";

import { useDashboardContext } from "@/context/DashboardContextProvider";
import { useEffect, useState } from "react";
import moment from "moment";

export function ReportCard({ description, title, onClick }) {
  const { date } = useDashboardContext();
  const [lastExported, setLastExported] = useState(null);

  useEffect(() => {
    setLastExported(moment(date).fromNow());
  }, [date]);

  return (
    <Card className="h-100">
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="pt-6" style={{ height: "108px" }}>
            {description}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1 rounded-md bg-primary text-primary-foreground">
          <Button onClick={onClick} variant="primary" className="px-3">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 text-sm text-muted-foreground mt-4">
          <div className="flex items-center">
            <CircleIcon className="mr-1 h-3 w-3 fill-sky-400 text-sky-400" />
            New
          </div>
          <div className="flex items-center"></div>
          <div>Last Exported {lastExported}</div>
        </div>
      </CardContent>
    </Card>
  );
}
