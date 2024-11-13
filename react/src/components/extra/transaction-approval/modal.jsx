import React from "react";

const Modal = ({ isOpen, onClose, onSubmit, actionType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Are you sure you want to {actionType}?
        </h2>
        <textarea
          className="w-full p-2 mb-4 border rounded"
          placeholder="Enter your notes or comments"
          rows="4"
        ></textarea>
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              actionType === "approve" ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={onSubmit}
          >
            {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
