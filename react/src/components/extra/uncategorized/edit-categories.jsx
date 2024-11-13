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
// import axios from "@/axios-client";

import { Pencil } from "lucide-react";
import axiosClient from "@/lib/axios-client";

export function DialogDemo({
  id,
  name,
  description,
  is_productive,
  header_name,
  icon,
  abbreviation,
  priority_id,
  updated_at,
  created_at,
}) {
  const [formData, setFormData] = useState({
    name: name,
    description: description,
    is_productive: is_productive,
    header_name: header_name,
    icon: icon,
    abbreviation: abbreviation,
    priority_id: priority_id,
    updated_at: updated_at,
    created_at: created_at,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    console.log("Updated data:", formData);

    // const apiUrl = "http://10.0.0.198/api";

    axiosClient
      .put(`/categories/${id}`, formData) // Pass formData in the request body
      .then((response) => {
        // Assuming status codes 2xx indicate success
        if (response.status >= 200 && response.status < 300) {
          // Handle success
          alert("Edited successfully");
          // Clear the form after successful update
          setFormData({
            name: "",
            description: "",
            is_productive: "",
            header_name: "",
            icon: "",
            abbreviation: "",
            priority_id: "",
            updated_at: "",
            created_at: "",
          });
        } else {
          // Handle non-success status
          throw new Error("Failed to edit category");
        }
      })
      .catch((error) => {
        // Handle error
        console.error("Error updating category:", error);
      });
  };

  const labels = {
    name: "Name",
    description: "Description",
    is_productive: "Is Productive",
    header_name: "Header Name",
    icon: "Icon",
    abbreviation: "Abbreviation",
    priority_id: "Priority Id",
    updated_at: "Update At",
    created_at: "Create At",
  };

  return (
    <Dialog>
      <DialogTrigger className="flex">
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          {/* Edit */}
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={key} className="text-right">
                {labels[key]}
              </Label>
              <Input
                id={key}
                name={key}
                value={value}
                className="col-span-3"
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSaveChanges}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
