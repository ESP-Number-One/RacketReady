import React from "react";

interface InputProps {
  type: "text" | "textarea" | "time";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  backgroundColor?: string;
}

export const Input: React.FC<InputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  backgroundColor = "bg-white",
}) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(event.target.value);
  };

  return (
    <div className={`relative w-full rounded ${backgroundColor}`}>
      {type === "text" && (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      {type === "textarea" && (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      {type === "time" && (
        <input
          type="time"
          value={value}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
};
