import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import axiosClient from '@/lib/axios-client';
import { useReducer } from 'react';
import { exportTracking } from '@/lib/export-reports';

// import { labels } from "../data/data"
// import { taskSchema } from "../data/schema"

export function DataTableRowActions({ row }) {
  const rerender = useReducer(() => ({}), {})[1]

  const handleDownloadFile = () => {
    let id = row.original.id
    exportTracking(id, row.original.filename)
  }

  const handleCancel = () => {
    axiosClient.post('/report/update-history', {
      id: row.original.id,
      status: 'failed'
    })
      .then((res) => {
        console.log(res);
        rerender()
      })
      .catch((err) => console.log(err))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleDownloadFile} className='cursor-pointer'>Download</DropdownMenuItem>
        {(row.original.status === 'pending') && <DropdownMenuItem onClick={handleCancel} className='cursor-pointer'>Cancel</DropdownMenuItem>}

        {/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.label}>
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>*/}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
