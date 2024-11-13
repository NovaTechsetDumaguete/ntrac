// import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";

export function PopoverHelper({ cell, id }) {
  return (
    <Popover id={id}>
      <PopoverTrigger asChild>{cell}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-bold leading-none">Details</h4>
            <p className="text-sm text-muted-foreground">
              {/* Detailed logs for the selected date. */}
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                defaultValue="Present"
                readOnly={true}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="timeIn">Time-in</Label>
              <Input
                id="timeIn"
                defaultValue="10:12"
                readOnly={true}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="timeOut">Time-out</Label>
              <Input
                id="timeOut"
                defaultValue="18:25"
                className="col-span-2 h-8"
                readOnly={true}
              />
            </div>
            {/* <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div> */}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
