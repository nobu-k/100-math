import type { ParallelogramProblem } from "../parallelogram";

const ParallelogramFig = ({ problem }: { problem: ParallelogramProblem }) => {
  const p = problem;
  const W = 220;
  const H = 140;
  const slant = 25;
  const bw = 120;
  const bh = 60;
  const ox = 20;
  const oy = H - 25;
  // A=top-left, B=bottom-left, C=bottom-right, D=top-right
  const B = { x: ox, y: oy };
  const C = { x: ox + bw, y: oy };
  const D = { x: ox + bw + slant, y: oy - bh };
  const A = { x: ox + slant, y: oy - bh };
  const pts = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`;

  const hasAngle = p.type === "angles";
  const hasDiag = p.type === "diagonals";

  // Diagonals intersection
  const O = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      <polygon points={pts} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
      {/* Parallel marks */}
      <text x={(A.x + D.x) / 2} y={(A.y + D.y) / 2 - 4} textAnchor="middle" fontSize={7} fill="#333">{"\u25b8\u25b8"}</text>
      <text x={(B.x + C.x) / 2} y={(B.y + C.y) / 2 + 10} textAnchor="middle" fontSize={7} fill="#333">{"\u25b8\u25b8"}</text>
      {/* Vertex labels */}
      <text x={A.x - 2} y={A.y - 6} textAnchor="middle" fontSize={9} fill="#333">A</text>
      <text x={B.x - 6} y={B.y + 4} textAnchor="end" fontSize={9} fill="#333">B</text>
      <text x={C.x + 6} y={C.y + 4} textAnchor="start" fontSize={9} fill="#333">C</text>
      <text x={D.x + 2} y={D.y - 6} textAnchor="middle" fontSize={9} fill="#333">D</text>
      {/* Diagonals */}
      {hasDiag && (
        <>
          <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#1976d2" strokeWidth={1} />
          <line x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke="#1976d2" strokeWidth={1} />
          <circle cx={O.x} cy={O.y} r={2.5} fill="#333" />
          <text x={O.x + 6} y={O.y - 4} fontSize={9} fill="#333">O</text>
        </>
      )}
      {/* Angle arc at A if angles type */}
      {hasAngle && (
        <text x={A.x + 14} y={A.y + 14} fontSize={9} fill="#1976d2" fontWeight="bold">
          {"\u2220"}A
        </text>
      )}
    </svg>
  );
};

export default ParallelogramFig;
