import { useState } from 'react';
import { echoInstance } from '@/lib/echo';
import { cn } from '@/lib/utils';

import { Badge } from "@ui/badge";
import { Checkbox } from "@ui/checkbox";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions"
import { queryClient } from '@/main';
import { useStateContext } from '@/context/ContextProvider';
import { useDashboardContext } from '@/context/DashboardContextProvider';

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
    value: "pending",
    label: "Pending",
    icon: StopwatchIcon,
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircledIcon,
  },
  {
    value: "failed",
    label: "Failed",
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

function ProgressLoader({ item }) {
  const { date } = useDashboardContext();
  const { currentTeam } = useStateContext();
  const [percentage, setPercentage] = useState(0)
  const [record, setRecord] = useState(item)
  const butaw = 100 / item.item_count;

  echoInstance.channel('export')
    .listen('ReportExported', (e) => {
      let processedFile = e.user;
      if ((processedFile.export_id === item.id) && (percentage < 100)) {
        setPercentage(butaw * processedFile.items_completed)
      } else {
        setRecord({ ...record, filename: processedFile.filename })
      }
    })

  if (percentage >= 100) {


    queryClient.refetchQueries(["history", date, currentTeam])
  }

  return percentage < 100 ? <Progress className='border max-w-[200px]' value={percentage} /> : <FileRecord item={record} />;
}

const FileRecord = ({ item }) => {
  return (<div className='flex flex-row'>
    <Avatar className="flex items-center justify-center">
      <AvatarImage
        className="h-6 w-6"
        src={'/icons/excel.png'}
        alt={item.id}
      />
      <AvatarFallback>
        {item.id}
      </AvatarFallback>
    </Avatar>
    <span className='grid content-center'>{item.filename}</span>
  </div>)
}

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="File/Progress" />
    ),
    cell: ({ row }) => (
      // <div className="w-[80px]">{`${row.original.employees.length} / ${row.original.employees.length}`}</div>
      <div className="flex gap-0 flex-row justify-start">
        {row.original.status === 'completed' ? (
          <div className='flex flex-row'>
            <Avatar className="flex items-center justify-center">
              <AvatarImage
                className="h-6 w-6"
                src={'/icons/excel.png'}
                alt={row.original.id}
              />
              <AvatarFallback>
                {row.original.id}
              </AvatarFallback>
            </Avatar>
            <span className='grid content-center'>{row.original.filename}</span>
          </div>

        ) : row.original.status === 'failed' ? (<span className='text-primary'>Failed</span>) : (
          <ProgressLoader item={row.original} />
        )}


      </div>
    ),
    enableHiding: false,
    size: 50,
  },
  {
    accessorKey: "team_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Team" />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label);
      const teamName = row.getValue("team_name") ?? 'undefined';
      return (
        <div className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className={cn("max-w-[500px] truncate font-medium", teamName === 'undefined' ? 'italic' : 'non-italic')}>
            {teamName}
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

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          {/* <span>{status.label}</span> */}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("type")}</span>
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
