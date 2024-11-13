import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowSingle,
} from "@ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import moment from "moment";

const CellBgColor = (day, cell, row) => {
  let now = moment().format("dddd").toLowerCase();
  const userIdsWithExemption = [145, 197];

  if (cell === undefined) return "border-r text-slate-200";

  if (day === "name") return "border-r";

  if (day === "saturday" || day === "sunday") return "bg-gray-100 border-r";

  // Check for exempted user IDs
  if (userIdsWithExemption.includes(row.original.employee.id)) {
    if (parseInt(cell) >= 7)
      return "bg-green-500 border-r text-white hover:text-black";
  }

  if (parseInt(cell) < 8 || cell === "Absent")
    return "bg-red-500 border-r text-white hover:text-black";

  if (parseInt(cell) >= 8)
    return "bg-green-500 border-r text-white hover:text-black";

  return "border-r text-white";
};

const tmpData = [
  {
    id: "ccbcd6e2-af49-4c9c-8045-e9bb94a4556f",
    employeeId: 1,
    name: "Jed Zerna",
    firstName: "Jed",
    lastName: "Zerna",
    status: "Away",
    online: "No Activity",
    sunday: "Restday",
    monday: "Absent",
    tuesday: "Late",
    wednesday: "Present",
    thursday: "Late",
    friday: "Present",
    saturday: "Restday",
  },
  {
    id: "9ade48d9-40e0-497a-a83a-ce2ef116b025",
    employeeId: 13,
    name: "Jerol Adorable",
    firstName: "Jerol",
    lastName: "Adorable",
    status: "Away",
    online: "No Activity",
    sunday: "Restday",
    monday: "Present",
    tuesday: "Present",
    wednesday: "Present",
    thursday: "Present",
    friday: "Present",
    saturday: "Restday",
  },
  {
    id: "369d9c97-aa4d-4d0f-964b-cf21a17c84c2",
    employeeId: 14,
    name: "Daisy Ann Lago",
    firstName: "Daisy Ann",
    lastName: "Lago",
    status: "Active",
    online: "No Activity",
    sunday: "Restday",
    monday: "Present",
    tuesday: "Present",
    wednesday: "Present",
    thursday: "Present",
    friday: "Present",
    saturday: "Restday",
  },
  {
    id: "0e77f912-a1cc-423c-8d9f-7e290d35fe4f",
    employeeId: 16,
    name: "Rickne Ian Lim",
    firstName: "Rickne Ian",
    lastName: "Lim",
    status: "Active",
    online: "No Activity",
    sunday: "Restday",
    monday: "Present",
    tuesday: "Present",
    wednesday: "Present",
    thursday: "Present",
    friday: "Present",
    saturday: "Restday",
  },
  {
    id: "67f92e95-0196-407f-ad52-b13196692a30",
    employeeId: 17,
    name: "Raineheart Cajes",
    firstName: "Raineheart",
    lastName: "Cajes",
    status: "Waiting",
    online: "No Activity",
    sunday: "Restday",
    monday: "Present",
    tuesday: "Present",
    wednesday: "Present",
    thursday: "Present",
    friday: "Present",
    saturday: "Restday",
  },
  {
    id: "4e501f17-12d0-494b-82d6-6dd5052e772e",
    employeeId: 20,
    name: "Kenneth Camacho",
    firstName: "Kenneth",
    lastName: "Camacho",
    status: "Active",
    online: "No Activity",
    sunday: "Restday",
    monday: "Present",
    tuesday: "Present",
    wednesday: "Present",
    thursday: "Present",
    friday: "Present",
    saturday: "Restday",
  },
  {
    id: "588e59dc-78ef-4443-ab1d-4b5e215c4829",
    employeeId: 25,
    name: "Kurt Weyne Gaso",
    firstName: "Kurt Weyne",
    lastName: "Gaso",
    status: "Waiting",
    online: "No Activity",
    sunday: "Restday",
    monday: "Present",
    tuesday: "Present",
    wednesday: "Present",
    thursday: "Present",
    friday: "Present",
    saturday: "Restday",
  },
  {
    id: "5f1e208e-7d7a-4ce6-91d0-cc1078f31a95",
    employeeId: 145,
    name: "Keth Boyd Brian Tampan",
    firstName: "Keth Boyd Brian",
    lastName: "Tampan",
    status: "Active",
    online: "No Activity",
    sunday: "Restday",
    monday: "Present",
    tuesday: "Present",
    wednesday: "Present",
    thursday: "Present",
    friday: "Present",
    saturday: "Restday",
  },
  {
    id: "9da61dab-93d4-4a7f-b945-ac8d2431ccf3",
    employeeId: 190,
    name: "Diana Rose Guinanas",
    firstName: "Diana Rose",
    lastName: "Guinanas",
    status: "Active",
    online: "No Activity",
    sunday: "Restday",
    monday: "Present",
    tuesday: "Present",
    wednesday: "Present",
    thursday: "Present",
    friday: "Present",
    saturday: "Restday",
  },
  {
    id: "9d13c213-5704-4798-9c92-e955da302804",
    employeeId: 197,
    name: "Lolita Alaban",
    firstName: "Lolita",
    lastName: "Alaban",
    status: "Active",
    online: "No Activity",
    sunday: "Restday",
    monday: "Present",
    tuesday: "Present",
    wednesday: "Present",
    thursday: "Present",
    friday: "Present",
    saturday: "Restday",
  },
];

export function DataTable({ columns, data }) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({
    sunday: false,
    saturday: false,
  });
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([{ id: "name", desc: false }]);

  const [pagination, setPagination] = React.useState({
    pageSize: 20,
    pageIndex: 0,
  });

  const table = useReactTable({
    // data: tmpData,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="text-center">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRowSingle
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-20"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        className={`hover:bg-muted/50 ${CellBgColor(
                          cell.column.columnDef.accessorKey,
                          cell.getValue(),
                          row // Pass row data here
                        )}`}
                        key={cell.id}
                        data-id={cell.getValue()}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRowSingle>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
