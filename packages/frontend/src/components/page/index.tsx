import type { ReactNode, JSX, CSSProperties } from "react";
import { Slot } from "../../lib/slotting";
import { BottomBar } from "../bottom_bar";
import { Header } from "./header";

interface PageProps {
  children: ReactNode[] | ReactNode;
  page?: "search" | "home" | "leagues" | "profile";
}

function PageImpl({ children: _children, page }: PageProps) {
  let children: ReactNode[];
  if (!(_children instanceof Array)) {
    children = [_children];
  } else {
    children = _children;
  }

  const header = Slot.find(children, PageImpl.Header);
  const body = Slot.find(children, PageImpl.Body);
  const footer = Slot.find(children, PageImpl.Footer);

  return (
    <div className="root-page flex h-screen w-screen flex-col">
      {header !== undefined && (
        <div className="flex-none w-full p-2 text-p-grey-900 font-title text-2xl font-bold">
          <div className="relative flex w-full">{header}</div>
        </div>
      )}
      <div className="flex-1 min-h-0 h-full px-2">{body}</div>
      <div className="flex-initial w-full font-title justify-end">
        {footer ? footer : <BottomBar activePage={page} />}
      </div>
    </div>
  );
}

interface BodyProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

PageImpl.Header = Header;

PageImpl.Body = function Body({ children, className = "" }: BodyProps) {
  return (
    <div
      className={`h-full ${className}`}
      style={{ viewTransitionName: "body-content" }}
    >
      {children}
    </div>
  );
};

PageImpl.Footer = function Footer({ children }: { children: ReactNode }) {
  return <>{children}</>;
};

interface PageT {
  (_: PageProps): JSX.Element;
  Header: (_: { children: ReactNode }) => JSX.Element;
  Body: (_: BodyProps) => JSX.Element;
  Footer: (_: { children: ReactNode }) => JSX.Element;
}

export const Page = PageImpl as PageT;
