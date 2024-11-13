// delete-categories.jsx
import React, { useState } from "react"; // Add import for useState
//import { EditIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axiosClient from "@/lib/axios-client";

import { Trash2 } from "lucide-react";

export function AlertDialogDemo({ id }) {
  // Destructure id from props
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    console.log("Deleting categories with id:", id);
    // Assuming you have your API endpoint stored in a variable
    // const apiUrl = "http://10.0.0.198/api";
    // fetch(`${apiUrl}/api/categories/${id}`, {
    //   method: "DELETE",
    // })
    axiosClient
      .delete(`/categories/${id}`)
      .then((response) => {
        if (response.ok) {
          // Handle success
          alert("Deleted successfully");
          setIsOpen(false); // Close the confirmation dialog
        } else {
          // Handle non-success status
          throw new Error("Failed to delete category");
        }
      })
      .catch((error) => {
        // Handle error
        console.error("Error deleting category:", error);
        setIsOpen(false); // Close the confirmation dialog
      });
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger className="flex">
        <Button
          variant="destructive"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Trash2 className="h-4 w-4" />
          {/* Delete */}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
