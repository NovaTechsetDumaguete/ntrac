import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import axiosClient from "@/lib/axios-client";

const ButtonComponent = ({ row, refreshData, managerId }) => {
  const [disabled, setDisabled] = useState(false);
  const [notes, setNotes] = useState(row.original.notes || "");

  const handleApprove = async () => {
    try {
      setDisabled(true);
      await axiosClient.post("/updateRequest", {
        status: "Approved",
        id: row.original.id,
        managerid: managerId,
        notes: notes,
      });
      refreshData();
    } catch (err) {
      console.error(err);
      setDisabled(false);
    }
  };

  const handleReject = async () => {
    try {
      setDisabled(true);
      await axiosClient.post("/updateRequest", {
        status: "Rejected",
        id: row.original.id,
        managerid: managerId,
        notes: notes,
      });
      refreshData();
    } catch (err) {
      console.error(err);
      setDisabled(false);
    }
  };

  return (
    <div className="flex">
      <Button
        size="3"
        variant="outline"
        onClick={handleApprove}
        disabled={disabled}
      >
        <CheckIcon className="h-4 w-4" color="green" />
      </Button>
      <Button
        size="3"
        variant="outline"
        onClick={handleReject}
        disabled={disabled}
      >
        <Cross1Icon className="h-4 w-4" color="red" />
      </Button>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes"
        className="ml-2 p-1 border border-gray-300 rounded"
        disabled={disabled}
      />
    </div>
  );
};

export default ButtonComponent;
