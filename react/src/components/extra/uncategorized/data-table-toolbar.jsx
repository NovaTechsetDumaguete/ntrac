import { Cross2Icon } from "@radix-ui/react-icons";

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

// import { DataTableFacetedFilter } from "./data-table-faceted-filter";

// import { DialogAdd } from "./add";
// import { useState } from "react";
import { NewCategory } from "./new-category";
import { useState } from "react";

export function DataTableToolbar({ table }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  // const [employeeFilter, setEmployeeFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  // const handleFilterByEmployee = (event) => {
  //   table.getColumn("employee")?.setFilterValue(event.target.value);
  //   // setEmployeeFilter(event.target.value);
  // };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* <Input
          placeholder="Filter by employee..."
          // value={employeeFilter}
          value={table.getColumn("name")?.getFilterValue() ?? ""}
          onChange={handleFilterByEmployee}
          className="h-8 w-[150px] lg:w-[250px]"
        /> */}
        <Input
          placeholder="Search..."
          value={searchFilter}
          onChange={(event) => {
            table.getColumn("description")?.setFilterValue(event.target.value);
            setSearchFilter(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />{" "}
        {/* {table.getColumn("is_productive") && (
          <DataTableFacetedFilter
            column={table.getColumn("userid")}
            title="Type"
            options={[
              { value: "1", label: "Productive" },
              { value: "0", label: "Unproductive" },
              { value: "2", label: "Neutral" },
            ]}
          />
        )} */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {<NewCategory className="mr-3" />}
      <DataTableViewOptions table={table} />
    </div>
  );
}
