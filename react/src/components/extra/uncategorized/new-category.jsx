import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
// import { cn } from "@/lib/utils";
// import { FilePlusIcon } from "@radix-ui/react-icons";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Textarea } from "@ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axiosClient from "@/lib/axios-client";

const formSchema = z.object({
  productivityType: z.enum(["1", "0"], {
    required_error: "You need to select the productivity type.",
  }),
  priorityLevel: z.enum(["1", "2", "3"], {
    required_error: "You need to select the priority level.",
  }),
  term: z.string().min(6, { message: "You need to enter a search term." }), // {required_error: }

  description: z.string().min(6, {
    message: "Description must be at least 6 characters",
  }),
  headerName: z.string().min(6, {
    message: "Header name must be at least 6 characters",
  }),
  applyChanges: z.boolean(),
});

export const NewCategory = ({ className, trigger, termValue }) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productivityType: "1",
      priorityLevel: "2",
      term: termValue ?? "",
      description: termValue ?? "",
      headerName: termValue ?? "",
      applyChanges: false,
    },
  });

  function renameKeys(obj, newKeys) {
    const keyValues = Object.keys(obj).map((key) => {
      const newKey = newKeys[key] || key;
      return { [newKey]: obj[key] };
    });
    return Object.assign({}, ...keyValues);
  }

  async function onSubmit(values) {
    const newVals = await renameKeys(values, {
      productivityType: "is_productive",
      priorityLevel: "priority_id",
      term: "name",
      description: "description",
      headerName: "header_name",
      applyChanges: "apply_changes",
    });

    console.log(newVals);
    const promise = () =>
      new Promise((resolve, reject) => {
        setOpen(false);
        axiosClient.post("/categories", newVals).then(
          (resp) => resolve(resp),
          (err) => reject(err)
        );
      });

    toast.promise(promise, {
      loading: "Applying changes...",
      success: (resp) => {
        return `${JSON.stringify(resp.data.message)}`;
      },
      error: (err) => {
        return `Error: ${err}`;
      },
      action: {
        label: "Close",
        onClick: () => console.log("Event has been created"),
      },
    });
  }

  const onErrors = (errors) => {
    console.log(errors, "error");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => setOpen(true)}
      className="sm:max-w-[425px]"
    >
      <DialogTrigger asChild>
        {/* <Button className={cn("mr-3 h-8 px-2 lg:px-3", className)}>
          <FilePlusIcon className="ml-2 h-4 w-4" />
          Add Category
        </Button> */}
        {trigger}
      </DialogTrigger>
      <DialogContent className="grid gap-6">
        <DialogHeader>
          <DialogTitle>Add new category</DialogTitle>
          <DialogDescription>
            Add a new category to your list.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onErrors)}
            className="grid gap-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="productivityType"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Productivity Type</FormLabel>
                      <FormControl>
                        <Select {...field} onValueChange={onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Productive</SelectItem>
                            <SelectItem value="0">Unproductive</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="priorityLevel"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <FormControl>
                        <Select onValueChange={onChange} {...field}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">High</SelectItem>
                            <SelectItem value="2">Medium</SelectItem>
                            <SelectItem value="3">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a term or phrase" {...field} />
                    </FormControl>
                    <FormDescription>
                      *Item description that will match to this term will be
                      tagged to this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Header Name */}
              <FormField
                control={form.control}
                name="headerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a Header Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Category description."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <FormField
                control={form.control}
                name="applyChanges"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="flex flex-col space-y-1">
                      Apply Changes
                    </FormLabel>
                    <FormControl>
                      <Switch onCheckedChange={onChange} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="justify-between space-x-2">
              <Button onClick={handleClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
