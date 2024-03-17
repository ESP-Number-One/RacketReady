import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import type { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import type { LocationState } from "../state/nav";
import { Link } from "./link";

export function BackLink({
  className,
  defaultLink,
  ...props
}: Omit<Omit<FontAwesomeIconProps, "icon">, "onclick"> & {
  defaultLink: string;
}) {
  const { state } = useLocation() as { state: LocationState };

  return (
    <Link
      className={className}
      href={
        state?.from && state.from.length > 0
          ? state.from[state.from.length - 1]
          : defaultLink
      }
      isBack
    >
      <FontAwesomeIcon {...{ ...props, icon: faChevronLeft }} />
    </Link>
  );
}
