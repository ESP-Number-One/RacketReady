import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";

export type IconProps = Omit<FontAwesomeIconProps, "style">;

export function Icon(props: IconProps) {
  return <FontAwesomeIcon {...props} className="flex" />;
}
