import type { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export function Icon(props: FontAwesomeIconProps) {
  return <FontAwesomeIcon {...props} className={`${props.className} flex`} />;
}
