import type { ReactNode, JSX, FormEventHandler } from "react";
import { useCallback, useState } from "react";
import { Slot } from "../../lib/slotting";
import { Page } from "../page";
import { Button } from "../button";
import { ErrorDiv } from "../error";

interface FormProps {
  children: ReactNode[] | ReactNode;
  onSubmit: () => Promise<void>;
  parentError?: string;
  submitText?: string;
}

function FormImpl({
  children: _children,
  onSubmit,
  parentError,
  submitText = "Submit",
}: FormProps) {
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(false);

  let children: ReactNode[];
  if (!(_children instanceof Array)) {
    children = [_children];
  } else {
    children = _children;
  }

  const header = Slot.find(children, FormImpl.Header);
  const body = Slot.find(children, FormImpl.Body);
  const footer = Slot.find(children, FormImpl.Footer);

  const onSubmitWrapper: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      setDisabled(true);
      onSubmit()
        .catch((err: string) => {
          setError(err.toString());
        })
        .finally(() => {
          setDisabled(false);
        });
    },
    [onSubmit],
  );

  return (
    <form onSubmit={onSubmitWrapper}>
      <Page>
        <Page.Header>{header}</Page.Header>
        <Page.Body className="flex flex-col overflow-y-scroll">
          {body}
          <ErrorDiv
            className="flex-none mt-2"
            error={parentError ? parentError : error}
          />
        </Page.Body>
        <Page.Footer>
          {footer ? (
            footer
          ) : (
            <Button type="submit" disabled={disabled}>
              {submitText}
            </Button>
          )}
        </Page.Footer>
      </Page>
    </form>
  );
}

interface WithChildrenProps {
  children: ReactNode;
}

FormImpl.Header = function Header({ children }: WithChildrenProps) {
  return children;
};

FormImpl.Body = function Body({ children }: WithChildrenProps) {
  return children;
};

FormImpl.Footer = function Body({ children }: WithChildrenProps) {
  return children;
};

interface FormT {
  (_: FormProps): JSX.Element;
  Header: (_: WithChildrenProps) => JSX.Element;
  Body: (_: WithChildrenProps) => JSX.Element;
  Footer: (_: WithChildrenProps) => JSX.Element;
}

export const Form = FormImpl as FormT;
