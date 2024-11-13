import React, { useRef } from "react";

const NotesInput = ({ value, onChange }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
    inputRef.current.focus();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Add notes"
      className="w-[150px] p-1 border border-gray-300 rounded"
    />
  );
};

export default NotesInput;
