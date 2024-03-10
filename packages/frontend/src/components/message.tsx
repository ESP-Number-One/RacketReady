export function Message({
  className,
  isIncoming,
  message,
}: {
  className?: string;
  isIncoming: boolean;
  message: string;
}) {
  return (
    <div
      className={`${className} ${
        isIncoming ? "bg-p-grey-100" : "bg-p-blue"
      } break-words rounded-lg text-white p-1 max-w-64`}
    >
      {message}
    </div>
  );
}
