import type { ReactNode, JSX, CSSProperties } from "react";
import { Slot } from "../../lib/slotting";
import { Header } from "./header";

function PageImpl({
  children: _children,
}: {
  children: ReactNode[] | ReactNode;
}) {
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
      <div className="w-full p-5 bg-slate-500 text-white font-title text-2xl font-bold">
        <div className="relative flex w-full">
          {header !== null ? header : null}
        </div>
      </div>
      <div className="h-full">{body}</div>
      <div className="w-full p-5 bg-slate-400 text-white font-title justify-end">
        {footer !== null ? footer : null}
      </div>
    </div>
  );
}

PageImpl.Header = Header;

PageImpl.Body = function Body({
  children,
  style,
}: {
  children: ReactNode;
  style: CSSProperties;
}) {
  return <div style={style}>{children}</div>;
};

PageImpl.Footer = function Footer({ children }: { children: ReactNode }) {
  return <>{children}</>;
};

interface PageT {
  (_: { children: ReactNode }): JSX.Element;
  Header: (_: { children: ReactNode }) => JSX.Element;
  Body: (_: { children: ReactNode; style: CSSProperties }) => JSX.Element;
  Footer: (_: { children: ReactNode }) => JSX.Element;
}

export const Page = PageImpl as PageT;
