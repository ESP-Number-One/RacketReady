export function LoadingAnimation() {
  return (
    <div className="loader w-full flex justify-items-center justify-center relative px-5">
      <span className="tracking-wide text-p-grey-200 font-bold py-2">
        PLEASE
      </span>
      <div className="inner grow relative">
        <img
          className="loading-rolling-animation loading ball w-[var(--loading-ball-width)] absolute top-[calc(0.5 * var(--loading-ball-width))]"
          src="/static/img/loading-ball.webp"
        />
      </div>
      <span className="tracking-wid text-p-grey-200 font-bold py-2">WAIT</span>
    </div>
  );
}
