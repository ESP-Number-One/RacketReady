import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

interface PageParamsBase {
  currPage: string; // to be used for nav page
  children: ReactNode;
}

interface PageParams extends PageParamsBase {
  heading?: ReactNode;
}

interface WithTitleParams extends PageParamsBase {
  heading: string | ReactNode;
  backUrl?: string;
  extra?: ReactNode;
}

export function Page({ heading, children }: PageParams) {
  return (
    <div className="w-full">
      {heading}
      <div className="px-4">{children}</div>
    </div>
  );
}

export function PageWithTitle({
  currPage,
  children,
  heading,
  backUrl,
  extra,
}: WithTitleParams) {
  const parts: ReactNode[] = [];

  if (backUrl) {
    // don't ask about the icon prop seems to be a bug in fontawesome
    parts.push(
      <div className="flex-initial w-8 mt-4">
        <a href={backUrl}>
          <FontAwesomeIcon icon={faChevronLeft} size="2x" />
        </a>
      </div>,
    );
  }

  const title =
    typeof heading === "string" ? (
      <h1 className="font-title font-semibold text-4xl text-p-grey-900">
        {heading}
      </h1>
    ) : (
      heading
    );
  parts.push(<div className="flex-auto">{title}</div>);

  if (extra) parts.push(<div className="flex-initial w-8">{extra}</div>);

  const headingNode = <div className="flex px-3 py-2">{parts}</div>;

  return (
    <Page currPage={currPage} heading={headingNode}>
      {children}
    </Page>
  );
}
