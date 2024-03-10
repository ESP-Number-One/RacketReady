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
      className={`${className} flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50 w-full`}
      role="alert"
    >
      <span className="font-medium">{error}</span>
    </div>
  );
}
