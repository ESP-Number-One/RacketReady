import { twMerge } from "tailwind-merge";

export function ErrorDiv({
  className = "",
  error,
}: {
  className?: string;
  error: string;
}) {
  if (error === "") return <></>;

  return (
    <div
      className={twMerge(
        `flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50 w-full`,
        className,
      )}
      role="alert"
    >
      <span className="font-medium">{error}</span>
    </div>
  );
}
