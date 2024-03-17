import { useMemo } from "react";

const CORNER_RADIUS = "15";
const BAR_HEIGHT = "61px";

interface ProgressBarProps {
  currentIndex: number;
  pageNames: string[];
}

export function ProgressBar({ currentIndex, pageNames }: ProgressBarProps) {
  console.log(currentIndex);

  const progress = useMemo(() => {
    return Math.min(Math.max(1, currentIndex + 1), pageNames.length);
  }, [currentIndex]);
  return (
    <div
      aria-labelledby="progress-bar-id"
      aria-valuemax={pageNames.length}
      aria-valuemin={1}
      aria-valuenow={progress}
      className="font-title"
      role="progressbar"
    >
      <svg
        aria-label={`Progress bar at ${Math.round(
          (progress * 100) / pageNames.length,
        )}%`}
        aria-labelledby="progress-bar-lbl"
        height={BAR_HEIGHT}
        role="img"
        width="100%"
      >
        <rect
          className="fill-p-grey-200"
          height="100%"
          rx={CORNER_RADIUS}
          ry={CORNER_RADIUS}
          width="100%"
        />
        <rect
          className="fill-progress-blue transition: duration-200"
          clipPath={`inset(0 0 0 0 round ${CORNER_RADIUS} ${
            progress === pageNames.length ? CORNER_RADIUS : 0
          } ${
            progress === pageNames.length ? CORNER_RADIUS : 0
          } ${CORNER_RADIUS})`}
          height="100%"
          width={`${100 * (progress / pageNames.length)}%`}
        />
        <text
          className="font-title font-bold text-4xl fill-white"
          dominantBaseline="middle"
          dy="5%"
          id="progress-bar-text"
          textAnchor="middle"
          x="50%"
          y="50%"
        >
          {pageNames[progress - 1]}
        </text>
      </svg>
    </div>
  );
}
