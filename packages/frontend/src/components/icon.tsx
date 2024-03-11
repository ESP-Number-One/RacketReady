import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { CSSProperties } from "react";

export type IconProps = FontAwesomeIconProps & { style?: CSSProperties };

export function Icon(props: IconProps) {
  return <FontAwesomeIcon {...props} className="flex" />;
}
