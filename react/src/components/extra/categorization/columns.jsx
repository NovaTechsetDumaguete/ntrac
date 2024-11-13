// import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Badge } from "@ui/badge";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  // CheckIcon,
  // Cross1Icon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
// import { Button } from "@/components/ui/button";

import EditCategoryDialog from "./edit"; // Change import statement
//import SendCategoryDialog from "./send-request"; // Change import statement
// import { BadgeHelp } from "lucide-react";

const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

export const statuses = [
  {
    value: "Approved",
    label: "Approved",
    icon: CheckCircledIcon,
  },
  {
    value: "Pending",
    label: "Pending",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "Rejected",
    label: "Rejected",
    icon: CrossCircledIcon,
  },
];

export const priorities = [
  {
    label: "Low",
    value: "3",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "2",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "1",
    icon: ArrowUpIcon,
  },
];

// const getIconColor = (value) => {
//   switch (value) {
//     case "Approved":
//       return "text-green-500";
//     case "Pending":
//       return "text-yellow-500";
//     case "Rejected":
//       return "text-red-500";
//     default:
//       return "text-gray-500";
//   }
// };

// const handleApprove = (row) => {
//   console.log(row, "approve");
// };

// const handleReject = (row) => {
//   console.log(row, "reject");
// };

const getProductivityType = (value) => {
  switch (value) {
    case "1":
      return "Productive";
    case "0":
      return "Unproductive";
    case "2":
    default:
      return "Neutral";
  }
};

export const columns = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate">
            {row.getValue("description")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "is_productive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Productive" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center w-[100px]">
          <span>{getProductivityType(row.getValue("is_productive"))}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "header_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Header Name" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate">
            {row.getValue("header_name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "icon",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Icon" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <img
            src={`/icons/${row.original.icon}`} // Corrected line
            className="aspect-square h-6 w-6" // Corrected class name
            alt="Icon" // Add alt attribute for accessibility
          />
        </div>
      );
    },
  },

  {
    accessorKey: "abbreviation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Abbreviation" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate">
            {row.getValue("abbreviation")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reason" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate">{row.getValue("reason")}</span>
      </div>
    ),
  },
  {
    accessorKey: "edited_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Edited By" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate">
          {row.getValue("edited_by")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "priority_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority ID" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate">
            {row.getValue("priority_id")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created at" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate">
            {row.getValue("created_at")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated at" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate">
            {row.getValue("updated_at")}
          </span>
        </div>
      );
    },
  },

  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      const isProductive = row.getValue("is_productive");
      const enableButtons = isProductive === "2";

      return (
        <div className="flex space-x-3">
          <EditCategoryDialog disabled={enableButtons} row={row} />
          {/* <EditCategoryDialog row={row} /> */}
          {/* {!disableButtons && <EditCategoryDialog row={row} />} */}
          {/*{!disableButtons && <SendCategoryDialog row={row} />}*/}
        </div>
      );
    },
  },
];
