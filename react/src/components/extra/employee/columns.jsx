import { cn } from "@/lib/utils";

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const statuses = [
  {
    value: "Active",
    label: "Active",
    icon: CheckCircledIcon,
  },
  {
    value: "Idle",
    label: "Idle",
    icon: CircleIcon,
  },
  {
    value: "Away",
    label: "Away",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "Offline",
    label: "Offline",
    icon: CrossCircledIcon,
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

const getIconColor = (value) => {
  switch (value) {
    case "Active":
      return "text-green-500";
    case "Away":
    case "Idle":
      return "text-yellow-500";
    case "Offline":
      return "text-gray-500";
    default:
      return "text-gray-500";
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Active":
      return "border-green-600";
    case "Away":
    case "Idle":
    case "Waiting":
      return "border-yellow-400";
    default:
      return "border-gray-300";
  }
};

export const columns = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "employeeId",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Employee ID"
        className={"pl-3"}
      />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] pl-3">{row.getValue("employeeId")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      // const label = labels.find((label) => label.value === row.original.label);
      // console.log(label);
      let status = row.original.status;
      let firstName = row.original.firstName;
      let lastName = row.original.lastName;

      return (
        <div className="flex space-x-2 ml-4 items-center">
          {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
          <div className={`avatar ${status.toLowerCase()}`}>
            <Avatar className={`h-10 w-10 border-2 ${getStatusStyle(status)}`}>
              <AvatarImage
                src={`/images/${row.original.id}.png`}
                alt="Avatar"
              />
              <AvatarFallback className="font-semi-bold">
                {`${firstName[0]}${lastName[0]}`}
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      );

      if (!status) return null;

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon
              className={cn(
                "mr-2 h-4 w-4 text-muted-foreground",
                getIconColor(status.value)
              )}
            />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    // toggleSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "online",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Online" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("online")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
