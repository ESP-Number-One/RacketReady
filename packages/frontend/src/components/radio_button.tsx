// RadioButton.tsx
import React from "react";

interface RadioButtonProps {
  name: string;
  value: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function RadioButton({
  name,
  value,
  label,
  icon,
  checked = false,
  onChange,
  isFirst = false,
  isLast = false,
}: RadioButtonProps) {
  const backgroundColor = checked ? "bg-p-green-100" : "bg-p-grey-100";
  let borderRadius = "rounded"; // default border radius on all sides
  if (isFirst) {
    borderRadius = "rounded-l-lg"; // default border radius on the left side
  } else if (isLast) {
    borderRadius = "rounded-r-lg"; // keep the medium border radius on the right side
  }
  return (
    <label
      className={`font-body text-xl font-bold text-white ${backgroundColor} active:scale-95 focus:outline-none ${
        icon ? "justify-start" : "justify-center"
      } inline-flex items-center w-full transform transition duration-150 ease-in-out border border-gray-300 ${borderRadius}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="hidden" // hide the radio input
      />
      {icon && <span className="mr-4 align-middle">{icon}</span>}
      {label}
    </label>
  );
}
