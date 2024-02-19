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
  return (
    <button
      type="button"
      className={`font-body text-3xl font-black text-white ${backgroundColor} hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ${
        icon ? "justify-start" : "justify-center"
      } inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full`}
    >
      {icon && <span className="mr-2 align-middle">{icon}</span>}
      {children}
    </button>
  );
}
