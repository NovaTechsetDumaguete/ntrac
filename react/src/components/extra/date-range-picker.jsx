import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
// import { format, subDays } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@ui/button";
import { Calendar } from "@ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import moment from "moment";

export function DateRangePicker({
  className,
  newDate,
  disabled,
  setDateRange,
  period,
}) {
  const [date, setDate] = React.useState({
    from: moment().subtract(7, "days").toDate(),
    to: moment().toDate(),
  });
  const [releaseDate, setReleaseDate] = React.useState(false);

  React.useEffect(() => {
    setDateRange(date);
    setReleaseDate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  React.useEffect(() => {
    if (releaseDate) {
      setReleaseDate(false);
    }
  }, [newDate, releaseDate]);

  React.useEffect(() => {
    if (period === "today") {
      setDate({
        from: moment().toDate(),
        to: moment().toDate(),
      });
    } else if (period === "yesterday") {
      setDate({
        from: moment().subtract(1, "days").toDate(),
        to: moment().subtract(1, "days").toDate(),
      });
    } else if (period === "previous-week") {
      let from = moment().weekday(-7);
      setDate({
        from: moment().weekday(-7).toDate(),
        to: from.add(6, "days").toDate(),
      });
    } else if (period === "previous-month") {
      let from = moment().subtract(1, "months");
      setDate({
        from: from.startOf("month").toDate(),
        to: from.endOf("month").toDate(),
      });
    }
  }, [period]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {moment(date.from).format("MMM DD, YYYY")} -{" "}
                  {moment(date.to).format("MMM DD, YYYY")}
                </>
              ) : (
                moment(date.from).format("MMM DD, YYYY")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
