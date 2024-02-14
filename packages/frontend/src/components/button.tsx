// Button component that takes in background color, text, and icon as props and returns button element with these properties
import type { ReactNode } from "react";
import React from "react";

// Defines the button input properties and their types
interface ButtonProps {
  backgroundColor?: string;
  children?: ReactNode;
  icon?: ReactNode; // A ReactNode is anything that can be rendered in React,
}

export function Button({ backgroundColor, children, icon }: ButtonProps) {
  return (
    <button
      type="button"
      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
    >
      {icon ? <span className="icon">{icon}</span> : undefined}
      {children}
    </button>
  );
}
