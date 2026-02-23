import type { ParallelAngleProblem } from "../parallel-angle";

const ParallelAngleFig = ({ problem }: { problem: ParallelAngleProblem }) => {
  const p = problem;
  const W = 200;
  const H = 150;
  const lineLen = 180;
  const lineY1 = 35;
  const lineY2 = 115;
  const transAngle = 65; // degrees from horizontal
  const toRad = (d: number) => (d * Math.PI) / 180;

  if (p.type === "vertical") {
    const cx = W / 2;
    const cy = H / 2;
    const len = 60;
    const ang = 50;
    const r1 = { x: cx + len * Math.cos(toRad(ang)), y: cy - len * Math.sin(toRad(ang)) };
    const r2 = { x: cx - len * Math.cos(toRad(ang)), y: cy + len * Math.sin(toRad(ang)) };
    const r3 = { x: cx + len * Math.cos(toRad(180 - ang)), y: cy - len * Math.sin(toRad(180 - ang)) };
    const r4 = { x: cx - len * Math.cos(toRad(180 - ang)), y: cy + len * Math.sin(toRad(180 - ang)) };
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <line x1={r1.x} y1={r1.y} x2={r2.x} y2={r2.y} stroke="#333" strokeWidth={1.5} />
        <line x1={r3.x} y1={r3.y} x2={r4.x} y2={r4.y} stroke="#333" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={2} fill="#333" />
        <text x={cx + 20} y={cy - 8} fontSize={10} fill="#1976d2" fontWeight="bold">{"\u2220"}a={p.givenAngle}°</text>
        <text x={cx - 45} y={cy + 16} fontSize={10} fill="#d32f2f" fontWeight="bold">{"\u2220"}b=?</text>
      </svg>
    );
  }

  // Parallel lines + transversal
  const ox = 10;
  // Intersection points
  const ix1 = ox + (H / 2 - lineY1) / Math.tan(toRad(transAngle)) + 30;
  const ix2 = ox + (H / 2 - lineY1 + (lineY2 - lineY1)) / Math.tan(toRad(transAngle)) + 30;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      {/* Parallel lines */}
      <line x1={ox} y1={lineY1} x2={ox + lineLen} y2={lineY1} stroke="#333" strokeWidth={1.5} />
      <line x1={ox} y1={lineY2} x2={ox + lineLen} y2={lineY2} stroke="#333" strokeWidth={1.5} />
      {/* Parallel markers */}
      <text x={ox + lineLen - 20} y={lineY1 - 4} fontSize={8} fill="#333">{"\u25b8"}</text>
      <text x={ox + lineLen - 20} y={lineY2 - 4} fontSize={8} fill="#333">{"\u25b8"}</text>
      {/* Transversal */}
      <line x1={ix1 - 25} y1={lineY1 - 20} x2={ix2 + 25} y2={lineY2 + 20}
        stroke="#333" strokeWidth={1.2} />
      {/* Angle labels */}
      <text x={ix1 + 8} y={lineY1 + 14} fontSize={9} fill="#1976d2" fontWeight="bold">{"\u2220"}a={p.givenAngle}°</text>
      {p.type === "corresponding" ? (
        <text x={ix2 + 8} y={lineY2 + 14} fontSize={9} fill="#d32f2f" fontWeight="bold">{"\u2220"}b=?</text>
      ) : (
        <text x={ix2 - 50} y={lineY2 - 4} fontSize={9} fill="#d32f2f" fontWeight="bold">{"\u2220"}b=?</text>
      )}
    </svg>
  );
};

export default ParallelAngleFig;
