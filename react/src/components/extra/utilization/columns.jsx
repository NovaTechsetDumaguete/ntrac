import { DataTableColumnHeader } from "./data-table-column-header";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  // CodeSandboxLogoIcon,
  CrossCircledIcon,
  LapTimerIcon,
  QuestionMarkCircledIcon,
  SketchLogoIcon,
  // StarIcon,
  // StopwatchIcon,
  TimerIcon,
} from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "./../../../main.scss";
import { PopoverHelper } from "@/components/layout/popover-helper";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

export const statuses = [
  {
    value: "Active",
    label: "Active",
    icon: CheckCircledIcon,
  },
  {
    value: "Inactive",
    label: "Inactive",
    icon: CircleIcon,
  },
  {
    value: "Break",
    label: "Break",
    icon: QuestionMarkCircledIcon,
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
];

const getStatusStyle = (status) => {
  switch (status) {
    case "Active":
      return "border-green-600";
    case "Away":
    case "Idle":
    case "Waiting":
      return "border-yellow-400";
    default:
      return "border-none";
  }
};

export const LoadingSpinner = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

const StatusIcon = ({ status }) => {
  switch (status) {
    // case "Present":
    //   return <CheckCircledIcon className="h-6 w-6 text-green-500" />;
    // case "Late":
    //   return <TimerIcon className="h-6 w-6 text-yellow-500" />;
    // case "Undertime":
    //   return <LapTimerIcon className="h-6 w-6 text-yellow-500" />;
    case undefined:
      return <CircleIcon className="h-8 w-8 text-white-500" />;
    case "Holiday":
      return <SketchLogoIcon className="h-8 w-8 text-blue-500" />;
    case "Absent":
      return <CrossCircledIcon className="h-8 w-8 text-white-500" />;
    case "Pending":
      return <LoadingSpinner className={"h-8 w-8 text-slate-600"} />;
    default:
      return status;
    // <Loader className="h-6 w-6 text-gray" />
  }
};

const getImage = (id) =>
  `${import.meta.env.VITE_API_BASE_URL}/api/employees/image/${id}`;

export const columns = () => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="items-center justify-around"
        title="Employees"
      />
    ),
    cell: ({ row }) => {
      let status = row.original.status;
      let { first, last, id } = row.original.employee;
      let initials = `${first[0]}${last[0]}`;
      let name = row.original.name;
      return (
        <div className="flex space-x-2 max-w-80 ml-4 items-center">
          <div className={`avatar ${status?.toLowerCase()}`}>
            <Avatar className={`h-10 w-10 border-2 ${getStatusStyle(status)}`}>
              <AvatarImage
                // src={`/images/${row.original.employeeId}.png`}
                src={getImage(id)}
                alt="Avatar"
              />
              <AvatarFallback className="font-semi-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex">{name}</div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "sunday",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="items-center justify-around"
        title="Sun"
      />
    ),
    cell: () => {
      return (
        <div className="flex justify-center">
          <span className="max-w-[80px] truncate font-medium text-lg"></span>
        </div>
      );
    },
  },
  {
    accessorKey: "monday",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="items-center justify-around"
        title={`Mon`}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <span className="max-w-[80px] truncate font-medium text-lg">
            <StatusIcon status={row.getValue("monday")} />
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "tuesday",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="items-center justify-around"
        title="Tue"
      />
    ),
    cell: ({ row }) => {
      return (
        <PopoverHelper
          id={row.original.id}
          cell={
            <div className="flex justify-center cursor-pointer">
              <span className="max-w-[80px] truncate font-medium text-lg">
                <StatusIcon status={row.getValue("tuesday")} />
              </span>
            </div>
          }
        />
      );
    },
  },
  {
    accessorKey: "wednesday",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="items-center justify-around"
        title="Wed"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <span className="max-w-[80px] truncate font-medium text-lg">
            <StatusIcon status={row.getValue("wednesday")} />
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "thursday",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="items-center justify-around"
        title="Thu"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <span className="max-w-[80px] truncate font-medium text-lg">
            <StatusIcon status={row.getValue("thursday")} />
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "friday",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="items-center justify-around"
        title="Fri"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <span className="max-w-[80px] truncate font-medium text-lg">
            <StatusIcon status={row.getValue("friday")} />
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "saturday",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="items-center justify-around"
        title="Sat"
      />
    ),
    cell: () => {
      return (
        <div className="flex justify-center">
          <span className="max-w-[80px] truncate font-medium text-lg"></span>
        </div>
      );
    },
  },
];
