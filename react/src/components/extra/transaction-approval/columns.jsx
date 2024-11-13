import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Badge } from "@ui/badge";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CheckIcon,
  Cross1Icon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import axiosClient from "@/lib/axios-client";
import React, { useState } from "react";
import { toast } from "react-toastify";

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
    case "Approved":
      return "text-green-500";
    case "Pending":
      return "text-yellow-500";
    case "Rejected":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

const ButtonComponent = ({ row, refreshData, managerId }) => {
  const [disabled, setDisabled] = useState(false);
  const [notes, setNotes] = useState(row.original.notes || "");

  const handleApprove = async () => {
    try {
      setDisabled(true);
      const res = await axiosClient.post("/updateRequest", {
        status: "Approved",
        id: row.original.id,
        managerid: managerId,
        notes: notes,
      });
      toast.success("Status updated");
      refreshData();
    } catch (err) {
      console.error(err);
      setDisabled(false);
    }
  };

  const handleReject = async () => {
    try {
      setDisabled(true);
      const res = await axiosClient.post("/updateRequest", {
        status: "Rejected",
        id: row.original.id,
        managerid: managerId,
        notes: notes,
      });
      toast.success("Status updated");
      refreshData();
    } catch (err) {
      console.error(err);
      setDisabled(false);
    }
  };

  return (
    <div className="flex">
      <Button
        size="3"
        variant="outline"
        onClick={handleApprove}
        disabled={disabled}
      >
        <CheckIcon className="h-4 w-4" color="green" />
      </Button>
      <Button
        size="3"
        variant="outline"
        onClick={handleReject}
        disabled={disabled}
      >
        <Cross1Icon className="h-4 w-4" color="red" />
      </Button>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes"
        className="ml-2 p-1 border border-gray-300 rounded"
        disabled={disabled}
      />
    </div>
  );
};

const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

export const columns = (refreshData, managerId) => [
  {
    accessorKey: "user_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee Name" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px]">{row.getValue("user_name")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
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
          <span className="max-w-[150px] truncate">
            {row.getValue("description")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "start_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Time" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">{row.getValue("start_time")}</div>
    ),
  },
  {
    accessorKey: "end_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Time" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">{row.getValue("end_time")}</div>
    ),
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">
        {formatDuration(row.getValue("duration"))}
      </div>
    ),
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

      if (!status) {
        return null;
      }

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
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      return (
        <ButtonComponent
          row={row}
          refreshData={refreshData}
          managerId={managerId}
        />
      );
    },
  },
];
