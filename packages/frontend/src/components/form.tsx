/* eslint-disable -- wejfhbew*/
import { ReactNode, useCallback, useState } from "react";

interface Props {
  onSubmit: () => Promise<void>;
  children: ReactNode;
}

export function Form({ onSubmit, children }: Props) {
  const [error, setError] = useState("");

  const onSubmitWrapper = useCallback(() => {
    onSubmit().catch((e) => setError(e));
  }, [onSubmit]);

  /* To do: switch to alternative buttons*/
  return (
    <div className="padding-20px">
      {children}
      <div className="text-red">{error}</div>
      <button
        className="backgroundColour-green borderRadius-3px padding-5px color-white paddingLeft-10px paddingRight-10px paddingTop-10px paddingBottom-8px"
        type="submit"
        onClick={onSubmitWrapper}
      >
        Submit
      </button>
    </div>
  );
}
