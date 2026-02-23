import type { CircleRDProblem } from "../circle-rd";

const CircleRDFig = ({ problem }: { problem: CircleRDProblem }) => {
  const p = problem;
  const W = 160;
  const H = 160;
  const cx = W / 2;
  const cy = H / 2;
  const cr = 50;
  const { figure } = p;
  const isKnownRadius =
    figure.type === "radius-to-diameter" || figure.type === "conceptual";
  const isKnownDiameter = figure.type === "diameter-to-radius";

  const radiusLabel = isKnownRadius ? `${figure.radius}cm` : "?";
  const diameterLabel = isKnownDiameter ? `${figure.diameter}cm` : figure.type === "conceptual" ? `${figure.diameter}cm` : "?";
  const radiusColor = isKnownRadius ? "#1976d2" : "#d32f2f";
  const diameterColor = isKnownDiameter || figure.type === "conceptual" ? "#1976d2" : "#d32f2f";

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", margin: "8px 0" }}
    >
      {/* Circle */}
      <circle cx={cx} cy={cy} r={cr} fill="none" stroke="#333" strokeWidth={1.5} />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2.5} fill="#333" />
      {/* Diameter line */}
      <line
        x1={cx - cr} y1={cy} x2={cx + cr} y2={cy}
        stroke={diameterColor} strokeWidth={1.5}
        strokeDasharray={isKnownDiameter || figure.type === "conceptual" ? "none" : "4 3"}
      />
      {/* Diameter label */}
      <text x={cx} y={cy - cr - 8} textAnchor="middle" fontSize={11} fill={diameterColor} fontWeight="bold">
        {figure.type === "conceptual" ? `直径 ${diameterLabel}` : `直径 = ${diameterLabel}`}
      </text>
      {/* Diameter arrows */}
      <line x1={cx - cr} y1={cy - 4} x2={cx - cr} y2={cy + 4} stroke={diameterColor} strokeWidth={1.5} />
      <line x1={cx + cr} y1={cy - 4} x2={cx + cr} y2={cy + 4} stroke={diameterColor} strokeWidth={1.5} />
      {/* Radius line (lower half) */}
      <line
        x1={cx} y1={cy} x2={cx + cr} y2={cy + 0.01}
        stroke={radiusColor} strokeWidth={2}
        strokeDasharray={isKnownRadius ? "none" : "4 3"}
      />
      {/* Radius label */}
      <text x={cx + cr / 2} y={cy + 20} textAnchor="middle" fontSize={11} fill={radiusColor} fontWeight="bold">
        {`半径 = ${radiusLabel}`}
      </text>
    </svg>
  );
};

export default CircleRDFig;
