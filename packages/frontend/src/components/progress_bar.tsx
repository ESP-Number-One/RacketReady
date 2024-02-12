const CORNER_RADIUS = "15";

interface ProgressBarProps {
  progress: number;
  pageNames: string[];
}

export function ProgressBar({
  progress: current,
  pageNames: names,
}: ProgressBarProps) {
  return (
    <div
      aria-labelledby="progress-bar-id"
      aria-valuemax={names.length}
      aria-valuemin={1}
      aria-valuenow={current}
      className="font-title"
      role="progressbar"
    >
      <svg
        aria-label={`Progress bar at ${Math.round(
          (current * 100) / names.length,
        )}%`}
        aria-labelledby="progress-bar-lbl"
        height="61px"
        role="img"
        width="100%"
      >
        <rect
          className="fill-pg-bar-gray"
          height="100%"
          rx={CORNER_RADIUS}
          ry={CORNER_RADIUS}
          width="100%"
        />
        <rect
          className="fill-pg-bar-blue transition: duration-200"
          clipPath={`inset(0 0 0 0 round ${CORNER_RADIUS} ${
            current === names.length ? CORNER_RADIUS : 0
          } ${current === names.length ? CORNER_RADIUS : 0} ${CORNER_RADIUS})`}
          height="100%"
          width={`${100 * (current / names.length)}%`}
        />
        <text
          className="font-title font-bold text-4xl fill-font-white"
          dominantBaseline="middle"
          dy="5%"
          id="progress-bar-id"
          textAnchor="middle"
          x="50%"
          y="50%"
        >
          {names[current - 1]}
        </text>
      </svg>
    </div>
  );
}
