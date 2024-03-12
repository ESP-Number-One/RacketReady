import type { ReactNode } from "react";

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
