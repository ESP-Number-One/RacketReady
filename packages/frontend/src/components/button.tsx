//Button component that takes in background color, text, and icon as props and returns button element with these properties
import type { CSSProperties, ReactNode } from "react";

//Defines the button input properties and their types
interface ButtonProps {
  backgroundColor?: string;
  children?: ReactNode;
  icon?: ReactNode; //A ReactNode is anything that can be rendered in React,
}

export function Button({ backgroundColor, children, icon }: ButtonProps) {
  const buttonStyle: CSSProperties = {
    backgroundColor: backgroundColor ?? "#4CAF50", // Default background color is green
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    display: "inline-block", //flex
  };

  return (
    <button className="bg-red text-white" style={buttonStyle} type="button">
      {icon ? <span className="icon">{icon}</span> : undefined}
      {children}
    </button>
  );
}
