import { useRef } from "react";
import { useDashboardContext } from "./../../context/DashboardContextProvider";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./../ui/button";
import { Calendar } from "./../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./../ui/popover";

export function DatePicker({ className }) {
  const { date, setDate } = useDashboardContext();
  const btnRef = useRef(null);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    btnRef.current.click();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={btnRef}
          variant={"outline"}
          className={cn(
            "max-w-64 justify-start text-left  font-normal",
            !date && "text-muted-foreground",
            className
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
  );
}
