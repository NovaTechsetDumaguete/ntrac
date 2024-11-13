import { useState } from 'react';
import { Button } from "@ui/button";

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

import { Send } from 'lucide-react';

const SendCategoryDialog = ({ row }) => {
  const [isOpen, setIsOpen] = useState(false); // Define isOpen state variable and setIsOpen function
  const handleClose = () => setIsOpen(false); // Define handleClose function to close the dialog

  return (
    <AlertDialog isOpen={isOpen} onDismiss={handleClose}>
      <AlertDialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Send className="mr-2" strokeWidth={1.5} />
          Send Request
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will be sent to the admin for review.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel> {/* Call handleClose on cancel */}
          <AlertDialogAction onClick={handleClose}>Continue</AlertDialogAction> {/* Call handleClose on continue */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SendCategoryDialog;
