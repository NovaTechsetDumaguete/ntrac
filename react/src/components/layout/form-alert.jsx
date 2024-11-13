import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ui/alert-dialog";

export const FormAlertTitle = ({ title }) => {
  return <AlertDialogTitle>{title}</AlertDialogTitle>;
};

const FormAlert = ({ open, setDialogOpen, title, description, children }) => {
  return (
    <AlertDialog open={open} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <FormAlertTitle title={title} />
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FormAlert;
