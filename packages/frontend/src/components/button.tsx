import type { ReactNode } from "react";

interface ButtonProps {
  backgroundColor?: string;
  children?: ReactNode;
  icon?: ReactNode;
  marginRemovalClasses?: string;
  // You can individually round any of the corners of the button, all rounded by defualt
  roundedCorners?: {
    topLeft?: boolean;
    topRight?: boolean;
    bottomLeft?: boolean;
    bottomRight?: boolean;
  };
}

export function Button({
  backgroundColor = "bg-p-green-100",
  children,
  icon,
  marginRemovalClasses = "", //This is used to remove the gap between buttons or pass in any other parameter to the button
  roundedCorners = {},
}: ButtonProps) {
  // merge the provided roundedCorners prop with the default values
  const defaultRoundedCorners = {
    topLeft: true,
    topRight: true,
    bottomLeft: true,
    bottomRight: true,
  };
  const mergedRoundedCorners = { ...defaultRoundedCorners, ...roundedCorners }; //Merges default and passed in rounded corners

  const borderRadius = `${
    mergedRoundedCorners.topLeft ? "rounded-tl-lg" : ""
  } ${mergedRoundedCorners.topRight ? "rounded-tr-lg" : ""} ${
    mergedRoundedCorners.bottomLeft ? "rounded-bl-lg" : ""
  } ${mergedRoundedCorners.bottomRight ? "rounded-br-lg" : ""}`;

  return (
    <button
      type="button"
      className={`font-body text-3xl font-bold text-white ${backgroundColor} active:scale-95 focus:outline-none font-medium ${borderRadius} text-sm px-5 py-2.5 ${
        icon ? "justify-start" : "justify-center"
      } inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 w-full transform transition duration-150 ease-in-out ${marginRemovalClasses}`}
    >
      {icon && <span className="mr-4 align-middle flex">{icon}</span>}
      {children}
    </button>
  );
}
