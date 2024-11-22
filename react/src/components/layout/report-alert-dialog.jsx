import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import moment from "moment";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import axiosClient from "@/lib/axios-client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui/alert-dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { getWorkDuration } from "@/Report";
import { DateRangePicker } from "../extra/date-range-picker";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Checkbox } from "@ui/checkbox";
import { useStateContext } from "@/context/ContextProvider";

const IDLE_APPS = ["Windows Default Lock Screen", "Task Switching", "Desktop"];

const productivityType = (type) => {
  let id = parseInt(type);
  switch (id) {
    case 0:
      return "Unproductive";
    case 1:
      return "Productive";
    case 2:
      return "Neutral";
    default:
      return "Neutral";
  }
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const FormSchema = z.object({
  date: z
    .enum(["yesterday", "previous-week", "previous-month", "custom"], {
      required_error: "You need to select an export period.",
    })
    .default("custom"),
  employees: z
    .array(z.number())
    .refine((value) => value.some((employee) => employee), {
      message: "You have to select at least one employee.",
    }),
});

const defaultValues = { employees: [] };

const convertSecsToDigital = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const getTotalWorkedKuno = (timein, timeout, data) => {
  let endTime =
    !moment(timein).isSame(moment(), "day") && timeout === null
      ? data[data.length - 1].time
      : moment(timeout, "HH:mm:ss").diff(
        moment(timein, "HH:mm:ss"),
        "seconds"
      ) > 0
        ? timeout
        : "23:59:59";
  let diff =
    moment(timein).isSame(moment(), "day") && timeout === null
      ? moment().diff(moment(timein, "HH:mm:ss"), "seconds")
      : moment(endTime, "HH:mm:ss").diff(moment(timein, "HH:mm:ss"), "seconds");
  return diff;
};

export const formatExcelData = (data, module) => {
  if (module === "attendance") {
    return data.map((d) => {
      return {
        ID: d.employee.employee_id,
        NAME: `${d.employee.first_name} ${d.employee.last_name}`,
        DATE: d.datein,
        "TIME-IN": d.timein,
        "TIME-OUT": d.timeout,
        LATE: "--:--",
        UNDERTIME: "--:--",
        TOTAL: getWorkDuration(d, false),
      };
    });
  }

  if (module === "applications") {
    let excelData = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const keys = Object.keys(element.info);
      keys.forEach((key) => {
        let duration = {};
        element.info[key].forEach((d) => {
          let dn = duration[d.date] || 0;
          duration[d.date] = dn + parseInt(d.duration);
        });
        Object.keys(duration).forEach((date) => {
          excelData.push({
            ID: element.info[key][0].employee.employee_id,
            DATE: date,
            EMPLOYEE:
              element.info[key][0].employee.first_name +
              " " +
              element.info[key][0].employee.last_name,
            CATEGORY: element.info[key][0].category.header_name || "",
            TYPE: productivityType(element.info[key][0].category.is_productive),
            DURATION: convertSecsToDigital(duration[date]),
            // SECONDS: duration[date],
          });
        });
      });
    }
    return excelData;
  }

  if (module === "tracking") {
    return data.map((d) => {
      let productiveKuno = (d) => {
        let sum = 0,
          neutral = 0;
        for (let i = 0; i < d.tasks.length; i++) {
          let k = parseInt(d.tasks[i].category.is_productive);
          if (k === 1 && !IDLE_APPS.includes(d.tasks[i].description)) {
            sum += d.tasks[i].duration;
          }
          if (k === 2 && !IDLE_APPS.includes(d.tasks[i].description)) {
            neutral += d.tasks[i].duration;
          }
        }
        return {
          productiveTime: sum,
          neutralTime: neutral,
        };
      };
      let { productiveTime, neutralTime } = productiveKuno(d);
      let totalWorkedTime = getTotalWorkedKuno(d.timein, d.timeout, d.tasks);
      let idleTime = totalWorkedTime - (productiveTime + neutralTime);
      // let productiveTime = productiveKuno(d);
      return {
        ID: d.employee.employee_id,
        DATE: d.datein,
        EMPLOYEE: `${d.employee.first_name} ${d.employee.last_name}`,
        "PRODUCTIVE-TIME": convertSecsToDigital(productiveTime),
        "NEUTRAL-APPS-TIME": convertSecsToDigital(neutralTime),
        "IDLE-TIME": d.timeout && convertSecsToDigital(idleTime),
        "TOTAL-WORK-TIME": convertSecsToDigital(totalWorkedTime),
        "TIME-IN": d.timein,
        "TIME-OUT": d.timeout,
      };
    });
  }
};

export const AlertDialogTemplate = ({
  open,
  setDialogOpen,
  module = "attendance",
  handleClickHist
}) => {
  const [employees, setEmployees] = useState([]);
  const { currentTeam } = useStateContext();
  const form = useForm({ resolver: zodResolver(FormSchema), defaultValues });
  const [dateRange, setDateRange] = useState({
    from: moment().subtract(7, "days").toDate(),
    to: moment().toDate(),
  });
  const [disabledDate, setDisabledDate] = useState(false);
  const [period, setPeriod] = useState("custom");

  const handlePeriordChange = (period) => {
    setPeriod(period);
    setDisabledDate(period !== "custom");
  };


  const onSubmit = (data) => {
    setDialogOpen(false);
    let from = moment(dateRange.from).format("YYYY-MM-DD");
    let to = moment(dateRange.to).format("YYYY-MM-DD");
    let moduleName = capitalizeFirstLetter(module);
    const promise = () =>
      new Promise((resolve, reject) => {
        axiosClient
          .get(`/reports/${module}/${from}/${to}`, {
            params: {
              employees: data.employees,
              teamId: currentTeam
            },
          })
          .then((resp) => resolve(resp))
          .catch((err) => reject(err));
      });

    if (module === 'tracking') {
      toast.promise(promise, {
        loading: 'Generating reports data...',
        success: (resp) => `Files downloaded.`,
        error: (err) => {
          console.log(err)
          return 'Processing...'
        },
        action: {
          label: 'Show',
          onClick: () => {
            handleClickHist()
            console.log('should redirect to export history page')
          }
        }
      })

      setTimeout(() => handleClickHist(), 1500)
      return;
    }

    toast.promise(promise, {
      loading: "Generating reports data...",
      success: ({ data }) => {
        const formattedData = formatExcelData(data.data, module)
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, moduleName);
        XLSX.writeFile(
          workbook,
          `nTrac-${moduleName}-Report-${moment().unix()}.xlsx`
        );
        return `Successfully exported`;
      },
      error: (err) => console.log(err),
      action: {
        label: "Close",
        onClick: () => console.log("Event has been created"),
      },
    });
  };

  useEffect(() => {
    axiosClient
      .get(`/employees/team/${currentTeam}`)
      .then(({ data }) => {
        let items = data.data;
        setEmployees(items);
        form.setValue(
          "employees",
          items.map(({ id }) => id)
        );
      })
      .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTeam]);

  return (
    <AlertDialog open={open} onOpenChange={setDialogOpen}>
      <Form {...form}>
        <form
          className="w-2/3 space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <AlertDialogTrigger asChild></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {capitalizeFirstLetter(module) + " Report Data" ||
                  "Are you absolutely sure?"}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base font-semibold">
                      Export period
                    </FormLabel>
                  </div>
                  <FormItem className="flex items-center space-x-3 space-y-0 w-[300px]">
                    <FormControl>
                      <Select
                        defaultValue="custom"
                        onValueChange={(value) => handlePeriordChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" disabled />
                        </SelectTrigger>
                        <SelectContent className="cursor-pointer">
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="yesterday">Yesterday</SelectItem>
                          <SelectItem value="previous-week">
                            Previous week
                          </SelectItem>
                          <SelectItem value="previous-month">
                            Previous month
                          </SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <DateRangePicker
                        disabled={disabledDate}
                        newDate={dateRange}
                        setDateRange={setDateRange}
                        period={period}
                      />
                    </FormControl>
                  </FormItem>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employees"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base font-semibold">
                      Employees
                    </FormLabel>
                  </div>
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value.length === employees.length}
                        onCheckedChange={(checked) => {
                          form.setValue(
                            "employees",
                            checked ? employees.map(({ id }) => id) : []
                          );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {field.value.length === employees.length
                        ? "Unselect All"
                        : "Select All"}
                    </FormLabel>
                  </div>
                  {employees.map((employee) => (
                    <FormField
                      key={employee.id}
                      control={form.control}
                      name="employees"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={employee.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(employee.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                      ...field.value,
                                      employee.id,
                                    ])
                                    : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== employee.id
                                      )
                                    );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {employee.last_name} {employee.first_name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter
              style={{
                diplay: "flex",
                justifyContent: "flex-end",
                marginTop: "10px",
              }}
            >
              <AlertDialogCancel onClick={() => setDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                Generate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </form>
      </Form>
    </AlertDialog>
  );
};
