import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface RadioButtonProps {
  checked?: boolean;
  icon?: ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  label?: ReactNode;
  name?: string;
  onChange?: (val: boolean) => void;
  value: string;
}

export function RadioButton({
  checked = false,
  icon,
  isFirst = false,
  isLast = false,
  label,
  name,
  onChange,
  value,
}: RadioButtonProps) {
  const backgroundColour = checked ? "bg-p-green-100" : "bg-p-grey-100";
  let borderRadius = "rounded"; // default border radius on all sides
  if (isFirst) {
    borderRadius = "rounded-l-lg"; // default border radius on the left side
  } else if (isLast) {
    borderRadius = "rounded-r-lg"; // keep the medium border radius on the right side
  }

  return (
    <label
      className={twMerge(
        "font-body text-xl font-bold text-white active:scale-95 focus:outline-none",
        "inline-flex items-center w-full transform transition duration-150 ease-in-out border border-gray-300",
        icon ? "justify-start" : "justify-center",
        backgroundColour,
        borderRadius,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => {
          if (onChange) onChange(e.target.checked);
        }}
        className="hidden" // hide the radio input
      />
      {icon && <span className="mr-4 align-middle">{icon}</span>}
      {label}
    </label>
  );
}
