import { type ReactNode, type JSX } from "react";
import { twMerge } from "tailwind-merge";
import { Slot } from "../../lib/slotting";
import { BottomBar } from "../bottom_bar";
import { Header } from "./header";

interface PageProps {
  children: ReactNode[] | ReactNode;
  page?: "search" | "home" | "leagues" | "profile";
}

function PageImpl({ children: _children, page }: PageProps) {
  const children = Slot.children(_children);

  const header = Slot.find(children, PageImpl.Header);
  const body = Slot.find(children, PageImpl.Body);
  const footer = Slot.find(children, PageImpl.Footer);

  return (
    <div className="root-page flex h-screen w-screen flex-col">
      {header !== undefined && (
        <div className="flex-none w-full text-p-grey-900 font-title text-2xl font-bold">
          {header}
        </div>
      )}
      <div className="flex-1 min-h-0 h-full">{body}</div>
      <div className="flex-initial w-full font-title justify-end">
        {footer ? footer : <BottomBar activePage={page} />}
      </div>
    </div>
  );
}

PageImpl.Header = Header;

export type BodySlotT = Slot.PageParams & {
  flexCol?: boolean;
  scrollable?: boolean;
};

PageImpl.Body = function PageBody({
  children,
  flexCol,
  scrollable,
  ...props
}: BodySlotT) {
  props.padding = props.padding ?? true;

  return (
    <div
      className={twMerge(
        "h-full",
        flexCol ? "flex flex-col" : "",
        scrollable ? "overflow-y-scroll" : "",
        Slot.genClassNames({ padding: true, paddingDir: "x", ...props }),
      )}
      style={{ viewTransitionName: "body-content" }}
    >
      {children}
    </div>
  );
};

PageImpl.Footer = function PageFooter({ children, ...props }: Slot.PageParams) {
  return <div className={Slot.genClassNames(props)}>{children}</div>;
};

interface PageT {
  (_: PageProps): JSX.Element;
  Header: (_: Slot.PageParams) => JSX.Element;
  Body: (_: BodySlotT) => JSX.Element;
  Footer: (_: Slot.PageParams) => JSX.Element;
}

export const Page = PageImpl as PageT;
