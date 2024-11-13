import React, { useState, useEffect } from "react";
import axiosClient from "@/lib/axios-client";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";

const AddCategories = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_productive: "1", // Default value set to '1' (Productive)
    header_name: "",
    icon: "",
    abbreviation: "",
    priority_id: "",
    updated_at: "",
    created_at: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post("/categories", formData);
      console.log("Category added successfully:", response.data);
      // Reset form after successful submission
      setFormData({
        name: "",
        description: "",
        is_productive: "1", // Reset to default value '1' (Productive)
        header_name: "",
        icon: "",
        abbreviation: "",
        priority_id: "",
        updated_at: "",
        created_at: "",
      });

      handleClose();
    } catch (error) {
      console.error("Error adding category:", error);
      // Handle error cases, such as displaying an error message to the user
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get("/categories", {
          params: {
            name: formData.name,
            description: formData.description,
            is_productive: formData.is_productive,
            header_name: formData.header_name,
            abbreviation: formData.abbreviation,
            priority_id: formData.priority_id,
          },
        });
        console.log(JSON.stringify(response.data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Trigger the effect whenever formData changes

  const fields = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "is_productive",
      label: "Transaction",
      type: "select",
      options: [
        { value: "1", label: "Productive" },
        { value: "0", label: "Neutral" },
        { value: "2", label: "Not Productive" },
      ],
    },
    { key: "header_name", label: "Header Name" },
    { key: "icon", label: "Icon" },
    { key: "abbreviation", label: "Abbreviation" },
    {
      key: "priority_id",
      label: "Priority Level",
      type: "select",
      options: [
        { value: "1", label: "High" },
        { value: "2", label: "Low" },
      ],
    },
    // { key: "updated_at", label: "Updated At" },
    // { key: "created_at", label: "Created At" },
  ];

  return (
    <div className="flex">
      <Dialog open={open} onDismiss={handleClose}>
        <DialogTrigger asChild>
          <Button>
            <FolderPlus className="mr-2" strokeWidth={1.5} />
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
              <DialogDescription>
                Make changes to your category here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label htmlFor={field.key} className="text-right">
                    {field.label}
                  </Label>
                  {field.type === "select" ? (
                    <select
                      id={field.key}
                      name={field.key}
                      value={formData[field.key]}
                      onChange={handleChange} // Update handleChange for dropdown
                      className="col-span-3 px-2 py-1 border rounded-md"
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.key}
                      name={field.key}
                      value={formData[field.key]}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onChange={handleClose} type="button">
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCategories;
