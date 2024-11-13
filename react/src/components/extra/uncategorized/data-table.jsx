import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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
} from "@ui/table";

import { DataTableToolbar } from "./data-table-toolbar";
import PaginationComponent from "../expandable/pagination-component";
import { Skeleton } from "@/components/ui/skeleton";

const getRandomWidth = (min = 100, max = 250) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function DataTable({ columns, data, isLoading, error }) {
  // eslint-disable-next-line no-unused-vars
  const [rowSelection, setRowSelection] = React.useState({});
  // eslint-disable-next-line no-unused-vars
  const [columnVisibility, setColumnVisibility] = React.useState({
    created_at: false,
  });
  // eslint-disable-next-line no-unused-vars
  const [columnFilters, setColumnFilters] = React.useState([]);
  // eslint-disable-next-line no-unused-vars
  const [sorting, setSorting] = React.useState([]);

  const [expanded, setExpanded] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      expanded,
      isLoading,
      error,
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    debugTable: true,
  });

  const SkellyBody = ({ length = 10 }) => {
    return [...Array(length).keys()].map(() => (
      <TableRow>
        {[...Array(columns.length).keys()].map((x) => (
          <TableCell key={x}>
            <Skeleton className={`h-[25px] w-[${getRandomWidth}px]`} />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

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
          {isLoading ? (
            <TableBody>
              <SkellyBody />
            </TableBody>
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    // data-state={row.original.level === 1 && "selected"}
                    className={row.original.level === 1 && "font-bold"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
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
          )}
        </Table>
      </div>
      {!isLoading && <PaginationComponent table={table} />}
    </div>
  );
}
