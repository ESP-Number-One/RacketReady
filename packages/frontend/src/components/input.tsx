import React, { ReactNode } from "react";

interface InputProps {
  type: "text" | "textarea" | "time";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  backgroundColor?: string;
  icon?: ReactNode;
  textAlign?: "center" | "left" | "right";
}

export const Input: React.FC<InputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  backgroundColor = "bg-p-grey-200",
  icon,
  textAlign = "left",
}) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(event.target.value);
  };

  const inputProps = {
    value,
    onChange: handleChange,
    placeholder,
    className: `w-full px-4 py-2.5 font-body text-2xl font-bold ${backgroundColor} focus:outline-none font-medium rounded-lg px-5 ${
      icon ? "justify-start" : "justify-center"
    } inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 w-full transform transition duration-150 ease-in-out m-0`,
    style: {
      color: value ? "white" : "rgba(255, 255, 255, 0.5)", // Set text color to white if there's a value, otherwise use a lighter shade of white for placeholder
      textAlign: textAlign,
    },
  };

  let InputComponent;
  switch (type) {
    case "text":
      InputComponent = <input type="text" {...inputProps} />;
      break;
    case "textarea":
      InputComponent = <textarea {...inputProps} />;
      break;
    case "time":
      InputComponent = <input type="time" {...inputProps} />;
      break;
    default:
      InputComponent = <input type="text" {...inputProps} />;
      break;
  }

  return (
    <div className={`relative w-full rounded ${backgroundColor}`}>
      <style>
        {`
          .input-white-placeholder::placeholder {
            color: white;
          }
        `}
      </style>
      {InputComponent}
      {icon && <span className="mr-4 align-middle flex">{icon}</span>}
    </div>
  );
};
