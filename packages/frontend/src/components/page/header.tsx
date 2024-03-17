import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import {
  type FontAwesomeIconProps,
  FontAwesomeIcon,
} from "@fortawesome/react-fontawesome";
import type { JSX, ReactNode } from "react";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Slot } from "../../lib/slotting";

interface HeaderI {
  (_: { children: ReactNode | ReactNode[] }): JSX.Element;
  Back: (
    _: Partial<FontAwesomeIconProps & { icon: never }>,
  ) => React.ReactElement;
  Title: (_: { children: ReactNode }) => JSX.Element;
  Right: (_: { children: ReactNode }) => JSX.Element;
}

function HeaderImpl({ children: _children, ...props }: Slot.PageParams) {
  const children = Slot.children(_children);

  const back = Slot.find(children, HeaderImpl.Back);
  const action = Slot.find(children, HeaderImpl.Right);
  const other = children.filter(
    (e) => ![back as ReactNode, action as ReactNode].includes(e),
  );

  return (
    <div
      className={twMerge(
        Slot.genClassNames({ padding: true, ...props }),
        "relative flex w-full",
      )}
    >
      {back !== undefined ? (
        <div className="absolute left-0 h-full">{back}</div>
      ) : null}
      <div className="flex flex-grow w-full justify-center">{other}</div>
      {action !== undefined ? (
        <div className="absolute right-0 h-full">{action}</div>
      ) : null}
    </div>
  );
}

HeaderImpl.Back = function Back(
  props: Partial<FontAwesomeIconProps & { icon: never }>,
) {
  return <FontAwesomeIcon {...{ ...props, icon: faCaretLeft }} />;
};

HeaderImpl.Title = function Title({ children }: { children: ReactNode }) {
  return <>{children}</>;
};

HeaderImpl.Right = function Right({ children }: { children: ReactNode }) {
  return <>{children}</>;
};

export const Header = HeaderImpl as HeaderI;
