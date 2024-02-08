export interface ProgressBarProps {
  progress: number;
  maxProgress: number;
  pageNames: string[];
}

export function ProgressBar({
  progress: current,
  maxProgress: maximum,
  pageNames: names,
}: ProgressBarProps) {
  const cornerRadius = "30";
  return (
    <div
      className="font-body"
      style={{
        padding: "0px",
        display: "flex",
        flexBasis: "fit-content",
        flexGrow: "initial",
      }}
    >
      <svg height="80px" width="100%">
        <rect
          height="100%"
          rx={cornerRadius}
          ry={cornerRadius}
          style={{ fill: "#95A5A6" }}
          width="100%"
        />
        <rect
          clipPath={`inset(0 0 0 0 round ${cornerRadius} ${
            current === maximum ? cornerRadius : 0
          } ${current === maximum ? cornerRadius : 0} ${cornerRadius})`}
          height="100%"
          style={{ fill: "#3498DB", transitionDuration: "0.4s" }}
          width={`${100 * (current / maximum)}%`}
        />
        <text
          color="font-gray"
          dominantBaseline="middle"
          dy="5%"
          fill="#f7f7ff"
          style={{
            fontSize: "2.5em",
            fontOpticalSizing: "auto",
            fontWeight: "bold",
          }}
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
