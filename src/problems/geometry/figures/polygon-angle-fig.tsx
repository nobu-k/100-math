import type { PolygonAngleProblem } from "../polygon-angle";

const PolygonAngleFig = ({ problem }: { problem: PolygonAngleProblem }) => {
  const p = problem;
  const W = 160;
  const H = 140;
  const cx = W / 2;
  const cy = H / 2 + 5;
  const r = 50;
  const n = p.n ?? 5;
  const offset = -Math.PI / 2 + Math.PI / n; // rotate so bottom is flat
  const pts = Array.from({ length: n }, (_, i) => {
    const angle = offset + (2 * Math.PI * i) / n;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const pointsStr = pts.map((pt) => `${pt.x},${pt.y}`).join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      <polygon points={pointsStr} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
      {p.type === "regular" && pts.map((pt, i) => {
        const next = pts[(i + 1) % n];
        const mx = (pt.x + next.x) / 2;
        const my = (pt.y + next.y) / 2;
        const dx = next.x - pt.x;
        const dy = next.y - pt.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len * 4;
        const ny = dx / len * 4;
        return <line key={i} x1={mx + nx - 3 * dy / len} y1={my + ny + 3 * dx / len}
          x2={mx + nx + 3 * dy / len} y2={my + ny - 3 * dx / len}
          stroke="#333" strokeWidth={0.8} />;
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
        {n}角形
      </text>
    </svg>
  );
};

export default PolygonAngleFig;
