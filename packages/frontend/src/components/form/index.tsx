import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { ErrorDiv } from "../error";

interface FormProps {
  onSubmit: () => Promise<void>;
  children: ReactNode;
}

export function Form({ onSubmit, children }: FormProps) {
  const [error, setError] = useState("");

  const onSubmitWrapper = useCallback(() => {
    onSubmit().catch((e: string) => {
      setError(e.toString());
    });
  }, [onSubmit]);

  // TODO: switch to alternative buttons
  return (
    <div className="padding-20px">
      {children}
      <ErrorDiv className="mb-4" error={error} />
      <button
        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
        onClick={onSubmitWrapper}
        type="submit"
      >
        Submit
      </button>
    </div>
  );
}
