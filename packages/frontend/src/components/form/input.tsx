import type { ChangeEvent, ReactElement, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
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
  type: "text" | "email" | "textarea" | "time" | "date";
  value: string;
}

export function Input({
  backgroundColor: backgroundColour = "bg-p-grey-100",
  className = "",
  disabled,
  id,
  icon,
  onChange = () => void 0,
  placeholder = "",
  required,
  textColor: textColour = "text-white",
  type,
  value,
}: InputProps) {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(e.target.value);
  };

  // Common styles for all input types
  const commonStyles = twMerge(
    icon ? "pl-8" : "pl-3",
    "font-body text-lg font-bold text-white w-full bg-transparent",
    "focus:outline-none inline-flex items-center w-full m-0",
    "focus:placeholder-white",
  );

  let inp: ReactNode;

  switch (type) {
    case "text":
    case "email":
      inp = (
        <input
          className={commonStyles}
          disabled={disabled}
          id={id}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
      );
      break;
    case "textarea":
      inp = (
        <textarea
          className={twMerge("resize-y", commonStyles)}
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
      className={twMerge(
        backgroundColour,
        textColour,
        "relative rounded-lg",
        className,
      )}
    >
      {icon && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 mr-2">
          {icon}
        </div>
      )}
      {inp}
    </div>
  );
}
