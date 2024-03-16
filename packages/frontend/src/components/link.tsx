import type { MouseEventHandler, ReactNode } from "react";
import { useCallback } from "react";
import { useViewNav } from "../state/nav";

interface LinkProps {
  className?: string;
  href: string;
  children: ReactNode;
}

export function Link({ className, href, children }: LinkProps) {
  const viewNav = useViewNav();
  const onClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (e) => {
      e.preventDefault();
      viewNav(href);
    },
    [href, viewNav],
  );
  return (
    <a className={className} href={href} onClick={onClick}>
      {children}
    </a>
  );
}
