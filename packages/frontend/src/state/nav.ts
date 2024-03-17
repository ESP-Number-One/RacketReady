import type { To } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

export type LocationState = null | {
  from?: string[];
};

export function useViewNav() {
  const navigate = useNavigate();
  const location = useLocation() as {
    pathname: string;
    state: LocationState;
  };

  return (newRoute: To, goingBack?: boolean) => {
    const options = {
      state: { from: location?.state?.from ?? [] },
    };

    if (goingBack) {
      options.state.from.pop();
    } else {
      options.state.from.push(location.pathname);
      // Just to make sure the history doesn't get too large
      if (options.state.from.length > 10) options.state.from.shift();
    }

    // Navigate to the new route
    if (
      !(document as unknown as { startViewTransition?: unknown })
        .startViewTransition
    ) {
      navigate(newRoute, options);
    } else {
      return document.startViewTransition(() => {
        navigate(newRoute, options);
      });
    }
  };
}
