import type { ReactNode, JSX, FormEventHandler, ReactElement } from "react";
import { Component, useCallback, useState } from "react";
import { Slot } from "../../lib/slotting";
import type { BodySlotT } from "../page";
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

  const children = Slot.children(_children);

  const header = Slot.find(children, FormImpl.Header);
  const body = Slot.find(children, FormImpl.Body) as ReactElement<BodySlotT>;
  const footer = Slot.find(children, FormImpl.Footer);

  const onSubmitWrapper: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();

      // Get buttons which aren't currently disabled so we can disable them
      // during the request
      const buttons = Array.from(document.querySelectorAll("button")).filter(
        (b) => !b.disabled,
      );
      buttons.forEach((b) => {
        b.disabled = true;
      });

      onSubmit()
        .catch((err: string) => {
          setError(err.toString());
        })
        .finally(() => {
          buttons.forEach((b) => {
            b.disabled = false;
          });
        });
    },
    [onSubmit],
  );

  const bodyProps = { ...body.props };
  delete bodyProps.children;

  return (
    <form onSubmit={onSubmitWrapper}>
      <Page>
        {header}
        <Page.Body {...bodyProps}>
          {body}
          <ErrorDiv className="flex-none" error={parentError ?? error} />
        </Page.Body>
        {footer || (
          <Page.Footer padding>
            <Button type="submit">{submitText}</Button>
          </Page.Footer>
        )}
      </Page>
    </form>
  );
}

FormImpl.Header = Page.Header;

FormImpl.Body = class FormBody extends Component<BodySlotT> {
  public static defaultProps = {
    spacing: true,
    flexCol: true,
    scrollable: true,
  };

  render(): ReactNode {
    return <>{this.props.children}</>;
  }
};

FormImpl.Footer = Page.Footer;

interface FormT {
  (_: FormProps): JSX.Element;
  Header: (_: Slot.PageParams) => JSX.Element;
  Body: typeof FormImpl.Body;
  Footer: (_: Slot.PageParams) => JSX.Element;
}

export const Form = FormImpl as FormT;
