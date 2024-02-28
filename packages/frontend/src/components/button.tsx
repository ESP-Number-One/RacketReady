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
  onClick?: () => void;
}

export function Button({
  backgroundColor = "bg-p-green-100",
  children,
  icon,
  roundedCorners = {},
  onClick = () => void 0,
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
      className={`font-body text-2xl font-bold text-white ${backgroundColor} active:scale-95 focus:outline-none ${borderRadius} px-5 py-2.5 ${
        icon ? "justify-start" : "justify-center"
      } inline-flex items-center w-full transform transition duration-150 ease-in-out m-0`}
      onClick={onClick}
    >
      {icon && <span className="mr-4 align-middle flex">{icon}</span>}
      {children}
    </button>
  );
}
