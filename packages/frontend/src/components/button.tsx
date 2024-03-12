import type { ReactNode } from "react";

interface ButtonProps {
  backgroundColor?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  // You can individually round any of the corners of the button, all rounded by defualt
  roundedCorners?: {
    bottomLeft?: boolean;
    bottomRight?: boolean;
    topLeft?: boolean;
    topRight?: boolean;
  };
  type?: "button" | "submit" | "reset";
}

export function Button({
  backgroundColor = "bg-p-green-100 disabled:bg-p-green-200",
  children,
  className = "",
  disabled,
  icon,
  onClick = () => void 0,
  roundedCorners = {},
  type,
}: ButtonProps) {
  // merge the provided roundedCorners prop with the default values
  const defaultRoundedCorners = {
    bottomLeft: true,
    bottomRight: true,
    topLeft: true,
    topRight: true,
  };
  const mergedRoundedCorners = { ...defaultRoundedCorners, ...roundedCorners }; //Merges default and passed in rounded corners

  const borderRadius = `${
    mergedRoundedCorners.topLeft ? "rounded-tl-lg" : ""
  } ${mergedRoundedCorners.topRight ? "rounded-tr-lg" : ""} ${
    mergedRoundedCorners.bottomLeft ? "rounded-bl-lg" : ""
  } ${mergedRoundedCorners.bottomRight ? "rounded-br-lg" : ""}`;

  return (
    <button
      disabled={disabled}
      type={type ?? "button"}
      className={`${className} font-body text-2xl font-bold text-white ${backgroundColor} focus:outline-none ${borderRadius} px-5 py-2.5 ${
        icon ? "justify-start" : "justify-center"
      } inline-flex items-center w-full ${
        !disabled &&
        "transform active:scale-95 transition duration-150 ease-in-out"
      }`}
      onClick={onClick}
    >
      {icon && <span className="mr-4 align-middle flex">{icon}</span>}
      {children}
    </button>
  );
}
