import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  // Column,
  // ExpandedState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  // ColumnDef,
  flexRender,
} from "@tanstack/react-table";

import React from "react";
// import { makeData } from "./make-data";
import PaginationComponent from "../pagination-component";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axios-client";
import { useDashboardContext } from "@/context/DashboardContextProvider";
import { useStateContext } from "@/context/ContextProvider";
import { secondsToHuman } from "@/lib/timehash";

export const ShowExpandableApps = ({ prodType, empId }) => {
  const { date } = useDashboardContext();
  const { currentTeam } = useStateContext();
  // const rerender = React.useReducer(() => ({}), {})[1];

  const isProductive = [
    "Unproductive apps",
    "Productive apps",
    "Neutral apps",
  ].indexOf(prodType);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "empId",
        header: ({ table }) => (
          <>
            {/* <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />{" "} */}
            {/* <button
              {...{
                onClick: table.getToggleAllRowsExpandedHandler(),
              }}
            >
              {table.getIsAllRowsExpanded() ? (
                <PlusCircledIcon />
              ) : (
                <PlusCircledIcon />
              )}
            </button>{" "} */}
            ID#
          </>
        ),
        cell: ({ row, getValue }) => (
          <div
            style={{
              // Since rows are flattened by default,
              // we can use the row.depth property
              // and paddingLeft to visually indicate the depth
              // of the row
              paddingLeft: `${row.depth * 2}rem`,
            }}
          >
            <div className="flex items-center justify-start space-x-2">
              {/* <IndeterminateCheckbox
                {...{
                  checked: row.getIsSelected(),
                  indeterminate: row.getIsSomeSelected(),
                  onChange: row.getToggleSelectedHandler(),
                }}
              />{" "} */}
              {row.getCanExpand() && (
                <Button
                  variant="ghost"
                  className="leading-6 m-0 p-1"
                  {...{
                    onClick: row.getToggleExpandedHandler(),
                    style: { cursor: "pointer" },
                  }}
                >
                  {row.getIsExpanded() ? (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM4.50003 7C4.22389 7 4.00003 7.22386 4.00003 7.5C4.00003 7.77614 4.22389 8 4.50003 8H10.5C10.7762 8 11 7.77614 11 7.5C11 7.22386 10.7762 7 10.5 7H4.50003Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                </Button>
              )}{" "}
              {getValue()}
            </div>
          </div>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.name,
        id: "name",
        cell: (info) => info.getValue(),
        header: () => <span>Employee</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "count",
        header: () => <span>Count</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "date",
        header: () => <span>Date</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "totalDuration",
        cell: ({ row, getValue }) =>
          row.getCanExpand() ? secondsToHuman(getValue()) : getValue(),
        header: () => <span>Total Duration (s)</span>,
        footer: (props) => props.column.id,
      },
    ],
    []
  );

  // const [data, setData] = React.useState(() => makeData(100, 5, 3));
  // const refreshData = () => setData(() => makeData(100, 5, 3));

  const [expanded, setExpanded] = React.useState({});

  const formatData = (data) => {
    let formattedData = [];
    const employees = [];

    data.forEach((item) => {
      if (!employees.includes(item.employee.id)) {
        formattedData.push({
          userid: item.employee.id,
          empId: item.employee.employee_id,
          name: item.employee.name,
          count: 1,
          totalDuration: item.duration,
          date: item.date,
          subRows: [
            {
              empId: item.userid,
              name: item.description,
              count: item.time,
              date: item.end_time,
              totalDuration: item.duration,
            },
          ],
        });
        employees.push(item.employee.id);
      } else {
        let index = formattedData.findIndex(
          (x) => x.userid === item.employee.id
        );
        formattedData[index].count += 1;
        formattedData[index].totalDuration += item.duration;
        formattedData[index].subRows.push({
          empId: item.userid,
          name: item.description,
          count: item.time,
          date: item.end_time,
          totalDuration: item.duration,
        });
      }
    });

    return formattedData;
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: async () => {
      const res = await axiosClient.post("dashboard/categoryapps", {
        date: date,
        teamId: currentTeam,
        isProductive: isProductive,
        empId: empId
      });
      return formatData(res.data.data);
    },
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // filterFromLeafRows: true,
    // maxLeafRowFilterDepth: 0,
    debugTable: true,
  });

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <>
      <div className="space-y-4">
        <div className="rounder-md border" />
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <PaginationComponent table={table} />
    </>
  );
};

export function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}) {
  const ref = React.useRef();

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
}

export default ShowExpandableApps;
