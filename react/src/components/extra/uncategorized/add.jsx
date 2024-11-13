import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosClient from "@/lib/axios-client";

import { FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function DialogAdd({ className }) {
  const apiUrl = "http://10.0.0.198/api";

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    isProductive: "",
    headerName: "",
    icon: "",
    abbreviation: "",
    priorityId: "",
    updatedAt: "",
    createdAt: "",
  });

  const handleSubmit = () => {
    console.log("Addedd data:", formData);

    axiosClient
      .post(`${apiUrl}/categories`, formData)
      .then((response) => {
        if (response.ok) {
          alert("Added successfully");
        } else {
          throw new Error("Failed to add category");
        }
      })
      .catch((error) => {
        console.error("Error adding category:", error);
      });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn("mr-3", className)}>
          <FilePlus className="mr-1" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="hidden"
            id="id"
            name="id"
            className="col-span-3"
            value=""
            onChange={handleInputChange}
          />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              className="col-span-3"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              className="col-span-3"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_productive" className="text-right">
              Is Productive
            </Label>
            <Input
              id="is_productive"
              name="is_productive"
              className="col-span-3"
              value={formData.isProductive}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="header_name" className="text-right">
              Header Name
            </Label>
            <Input
              id="header_name"
              name="header_name"
              className="col-span-3"
              value={formData.headerName}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">
              Icon
            </Label>
            <Input
              id="icon"
              name="icon"
              className="col-span-3"
              value={formData.icon}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="abbreviation" className="text-right">
              Abbreviation
            </Label>
            <Input
              id="abbreviation"
              name="abbreviation"
              className="col-span-3"
              value={formData.abbreviation}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority_id" className="text-right">
              Priority Id
            </Label>
            <Input
              id="priority_id"
              name="priority_id"
              className="col-span-3"
              value={formData.priorityId}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="updated_at" className="text-right">
              Updated At
            </Label>
            <Input
              id="updated_at"
              name="updated_at"
              className="col-span-3"
              value={formData.updatedAt}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="created_at" className="text-right">
              Created At
            </Label>
            <Input
              id="created_at"
              name="created_at"
              className="col-span-3"
              value={formData.createdAt}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
