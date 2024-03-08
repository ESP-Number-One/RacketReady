import { AbilityLevel, Sport } from "@esp-group-one/types";

export function sportToColour(sport: Sport) {
  return `bg-${sport}`;
}

export function abilityToColour(level: AbilityLevel) {
  return `bg-${level}`;
}
