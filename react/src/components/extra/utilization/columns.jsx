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

const StatusIcon = ({ status }) => {
  switch (status) {
    case "Present":
      return <CheckCircledIcon className="h-6 w-6 text-green-500" />;
    case "Late":
      return <TimerIcon className="h-6 w-6 text-yellow-500" />;
    case "Undertime":
      return <LapTimerIcon className="h-6 w-6 text-yellow-500" />;
    case "Holiday":
      return <SketchLogoIcon className="h-6 w-6 text-blue-500" />;
    case "Absent":
      return <CrossCircledIcon className="h-6 w-6 text-red-500" />;
    default:
      return <CircleIcon className="h-6 w-6 text-gray-500" />;
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
      let firstName = row.original.firstName;
      let lastName = row.original.lastName;
      return (
        <div className="flex space-x-2 ml-4 items-center">
          <div className={`avatar ${status?.toLowerCase()}`}>
            <Avatar className={`h-10 w-10 border-2 ${getStatusStyle(status)}`}>
              <AvatarImage
                // src={`/images/${row.original.employeeId}.png`}
                src={getImage(row.original.employeeId)}
                alt="Avatar"
              />
              <AvatarFallback className="font-semi-bold">
                {`${firstName[0]}${lastName[0]}`}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex">{row.getValue("name")}</div>
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
          <span className="max-w-[80px] truncate font-medium"></span>
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
          <span className="max-w-[80px] truncate font-medium">
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
              <span className="max-w-[80px] truncate font-medium">
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
          <span className="max-w-[80px] truncate font-medium">
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
          <span className="max-w-[80px] truncate font-medium">
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
          <span className="max-w-[80px] truncate font-medium">
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
          <span className="max-w-[80px] truncate font-medium"></span>
        </div>
      );
    },
  },
];
