import type { TriAngleProblem } from "../triangle-angle";

const TriangleAngleFig = ({ problem }: { problem: TriAngleProblem }) => {
  const p = problem;
  const W = 200;
  const H = 140;
  const pad = 20;
  // Draw a triangle that roughly matches the angles
  const a1 = p.knownAngles[0];
  const a2 = p.knownAngles[1];
  const toRad = (d: number) => (d * Math.PI) / 180;
  const bx = W - pad;
  const by = H - pad;
  const ax = pad;
  const ay = H - pad;
  const baseLen = bx - ax;
  // Apex from angle at A (a1) using sin rule approximation
  const apexX = ax + baseLen * 0.4;
  const h = Math.min(H - pad * 2, baseLen * 0.6);
  const apexY = ay - h;

  const arcPath = (vx: number, vy: number, startDeg: number, endDeg: number, r: number) => {
    const s = { x: vx + r * Math.cos(toRad(startDeg)), y: vy - r * Math.sin(toRad(startDeg)) };
    const e = { x: vx + r * Math.cos(toRad(endDeg)), y: vy - r * Math.sin(toRad(endDeg)) };
    return `M ${s.x} ${s.y} A ${r} ${r} 0 0 0 ${e.x} ${e.y}`;
  };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      <polygon points={`${ax},${ay} ${bx},${by} ${apexX},${apexY}`}
        fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
      {/* Angle at A */}
      <path d={arcPath(ax, ay, 0, Math.atan2(ay - apexY, apexX - ax) * 180 / Math.PI, 18)}
        fill="none" stroke="#1976d2" strokeWidth={1.2} />
      <text x={ax + 25} y={ay - 8} fontSize={9} fill="#1976d2" fontWeight="bold">{a1}°</text>
      {/* Angle at B */}
      <path d={arcPath(bx, by, 180 - Math.atan2(by - apexY, bx - apexX) * 180 / Math.PI, 180, 18)}
        fill="none" stroke="#1976d2" strokeWidth={1.2} />
      <text x={bx - 30} y={by - 8} fontSize={9} fill="#1976d2" fontWeight="bold">{a2}°</text>
      {/* Unknown at apex */}
      <text x={apexX} y={apexY - 6} textAnchor="middle" fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
      {/* Vertex labels */}
      <text x={ax - 4} y={ay + 14} textAnchor="middle" fontSize={9} fill="#666">A</text>
      <text x={bx + 4} y={by + 14} textAnchor="middle" fontSize={9} fill="#666">B</text>
      <text x={apexX} y={apexY - 14} textAnchor="middle" fontSize={9} fill="#666">C</text>
      {/* Exterior angle extension if needed */}
      {p.type === "exterior" && (
        <>
          <line x1={bx} y1={by} x2={bx + 40} y2={by} stroke="#333" strokeWidth={1} />
          <path d={arcPath(bx, by, 0, Math.atan2(by - apexY, bx - apexX) * 180 / Math.PI, 22)}
            fill="none" stroke="#d32f2f" strokeWidth={1.5} strokeDasharray="3 2" />
        </>
      )}
    </svg>
  );
};

export default TriangleAngleFig;
