import type { CircleAreaProblem } from "../circle-area";

const CircleAreaFig = ({ problem }: { problem: CircleAreaProblem }) => {
  const p = problem;
  const W = 160;
  const H = 160;
  const cx = W / 2;
  const cy = H / 2;
  const cr = 50;
  const { figure } = p;

  if (figure.type === "full") {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <circle cx={cx} cy={cy} r={cr} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={2.5} fill="#333" />
        <line x1={cx} y1={cy} x2={cx + cr} y2={cy} stroke="#1976d2" strokeWidth={1.5} />
        <text x={cx + cr / 2} y={cy + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          半径 = {figure.radius}cm
        </text>
      </svg>
    );
  }

  // Semicircle
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      <defs>
        <clipPath id="semiclip">
          <rect x={cx - cr - 1} y={cy - cr - 1} width={cr * 2 + 2} height={cr + 1} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={cr} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} clipPath="url(#semiclip)" />
      <line x1={cx - cr} y1={cy} x2={cx + cr} y2={cy} stroke="#333" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={2.5} fill="#333" />
      <line x1={cx} y1={cy} x2={cx + cr} y2={cy} stroke="#1976d2" strokeWidth={2} />
      <text x={cx + cr / 2} y={cy + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
        半径 = {figure.radius}cm
      </text>
    </svg>
  );
};

export default CircleAreaFig;
