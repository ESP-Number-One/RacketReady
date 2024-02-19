import type { ReactNode } from "react";

interface ButtonProps {
  backgroundColor?: string;
  children?: ReactNode;
  icon?: ReactNode;
}

export function Button({
  backgroundColor = "bg-p-green-100",
  children,
  icon,
}: ButtonProps) {
  const hoverColor = backgroundColor.includes("green")
    ? "hover:bg-p-green-200"
    : backgroundColor.includes("red")
      ? "hover:bg-p-red-200"
      : "";

  return (
    <button
      type="button"
      className={`font-body text-2xl font-black text-white ${backgroundColor} ${hoverColor} active:scale-95 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 ${
        icon ? "justify-start" : "justify-center"
      } inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 w-full transform transition duration-150 ease-in-out`}
    >
      {icon && <span className="mr-2 align-middle">{icon}</span>}
      {children}
    </button>
  );
}
