import type { To } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function useViewNav() {
  const navigate = useNavigate();
  return (newRoute: To) => {
    // Navigate to the new route
    if (
      !(document as unknown as { startViewTransition?: unknown })
        .startViewTransition
    ) {
      navigate(newRoute);
    } else {
      return document.startViewTransition(() => {
        navigate(newRoute);
      });
    }
  };
}
