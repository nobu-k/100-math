import type { CircumferenceProblem } from "../circumference";

const CircumferenceFig = ({ problem }: { problem: CircumferenceProblem }) => {
  const p = problem;
  const W = 160;
  const H = 160;
  const cx = W / 2;
  const cy = H / 2;
  const cr = 50;
  const { figure } = p;
  const isForward = figure.mode === "forward";

  const diaColor = isForward ? "#1976d2" : "#d32f2f";
  const circColor = isForward ? "#d32f2f" : "#1976d2";
  const diaLabel = isForward ? `直径 = ${figure.diameter}cm` : "直径 = ?";
  const diaDash = isForward ? "none" : "4 3";

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      {/* Circle */}
      <circle cx={cx} cy={cy} r={cr} fill="none" stroke={circColor} strokeWidth={2} />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2.5} fill="#333" />
      {/* Diameter line */}
      <line x1={cx - cr} y1={cy} x2={cx + cr} y2={cy}
        stroke={diaColor} strokeWidth={1.5} strokeDasharray={diaDash} />
      {/* Diameter end marks */}
      <line x1={cx - cr} y1={cy - 4} x2={cx - cr} y2={cy + 4} stroke={diaColor} strokeWidth={1.5} />
      <line x1={cx + cr} y1={cy - 4} x2={cx + cr} y2={cy + 4} stroke={diaColor} strokeWidth={1.5} />
      {/* Diameter label */}
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={10} fill={diaColor} fontWeight="bold">
        {diaLabel}
      </text>
      {/* Circumference indicator */}
      <text x={cx} y={cy - cr - 8} textAnchor="middle" fontSize={10} fill={circColor} fontWeight="bold">
        {isForward ? "円周 = ?" : `円周 = ${Number((figure.diameter * 3.14).toFixed(2))}cm`}
      </text>
    </svg>
  );
};

export default CircumferenceFig;
