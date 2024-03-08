import type { ChangeEvent, ReactElement, ReactNode } from "react";
import { useState } from "react";
import type { IconProps } from "../icon";

interface InputProps {
  onChange: (val: string) => void;
  type: "text" | "textarea" | "time" | "date";
  placeholder: string;
  icon?: ReactElement<IconProps>;
  backgroundColor?: string;
  textColor?: string;
}

export function Input({
  type,
  placeholder,
  icon,
  onChange,
  backgroundColor = "bg-p-grey-100",
  textColor = "text-white",
}: InputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(e.target.value);
    setInputValue(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (inputValue === "") {
      setIsFocused(false);
    }
  };

  // Common styles for all input types
  const commonStyles = `font-body text-2xl font-bold text-white w-full bg-transparent focus:outline-none
  inline-flex items-center w-full transform transition duration-150 ease-in-out m-0 ${
    isFocused ? "" : "placeholder-white"
  } ${icon ? "pl-5" : "pl-6"}`;

  let inp: ReactNode;

  switch (type) {
    case "text":
      inp = (
        <input
          type="text"
          placeholder={isFocused ? "" : placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={commonStyles}
        />
      );
      break;
    case "textarea":
      inp = (
        <textarea
          placeholder={isFocused ? "" : placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`${commonStyles} resize-none`}
        />
      );
      break;
    case "time":
      inp = (
        <input
          type="time"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={commonStyles}
        />
      );
      break;
    case "date":
      inp = (
        <input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={commonStyles}
        />
      );
      break;
  }

  return (
    <div className={`relative ${backgroundColor} ${textColor} rounded-lg p-2`}>
      {icon && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
          {icon}
        </div>
      )}
      {inp}
    </div>
  );
}
