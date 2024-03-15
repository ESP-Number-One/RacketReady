import type { ChangeEvent, ReactElement, ReactNode } from "react";
import type { IconProps } from "../icon";

interface InputProps {
  backgroundColor?: string;
  className?: string;
  disabled?: boolean;
  icon?: ReactElement<IconProps>;
  id?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  textColor?: string;
  type: "text" | "textarea" | "time" | "date";
  value: string;
}

export function Input({
  backgroundColor = "bg-p-grey-100",
  className = "",
  disabled,
  id,
  icon,
  onChange = () => void 0,
  placeholder = "",
  required,
  textColor = "text-white",
  type,
  value,
}: InputProps) {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(e.target.value);
  };

  // Common styles for all input types
  const commonStyles = `${
    icon ? "pl-3" : "pl-3"
  } font-body text-lg font-bold text-white w-full bg-transparent focus:outline-none
  inline-flex items-center w-full m-0 focus:placeholder-white`;

  let inp: ReactNode;

  switch (type) {
    case "text":
      inp = (
        <input
          className={commonStyles}
          disabled={disabled}
          id={id}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          type="text"
          value={value}
        />
      );
      break;
    case "textarea":
      inp = (
        <textarea
          className={`${commonStyles} resize-y`}
          disabled={disabled}
          id={id}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          value={value}
        />
      );
      break;
    case "time":
      inp = (
        <input
          className={commonStyles}
          disabled={disabled}
          id={id}
          onChange={handleInputChange}
          required={required}
          type="time"
          value={value}
        />
      );
      break;
    case "date":
      inp = (
        <input
          className={commonStyles}
          disabled={disabled}
          id={id}
          onChange={handleInputChange}
          required={required}
          type="date"
          value={value}
        />
      );
      break;
  }

  return (
    <div
      className={`${className} ${backgroundColor} ${textColor} relative rounded-lg p-2`}
    >
      {icon && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
          {icon}
        </div>
      )}
      {inp}
    </div>
  );
}
