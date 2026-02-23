import type { AngleProblem } from "../angle";

const AngleFig = ({ problem }: { problem: AngleProblem }) => {
  const p = problem;
  const W = 160;
  const H = 120;
  const vx = 20;
  const vy = H - 15;
  const rayLen = 120;
  const arcR = 30;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const rayEnd = (deg: number) => ({
    x: vx + rayLen * Math.cos(toRad(deg)),
    y: vy - rayLen * Math.sin(toRad(deg)),
  });

  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const s = { x: vx + r * Math.cos(toRad(startDeg)), y: vy - r * Math.sin(toRad(startDeg)) };
    const e = { x: vx + r * Math.cos(toRad(endDeg)), y: vy - r * Math.sin(toRad(endDeg)) };
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  };

  const labelPos = (startDeg: number, endDeg: number, r: number) => {
    const mid = (startDeg + endDeg) / 2;
    return { x: vx + r * Math.cos(toRad(mid)), y: vy - r * Math.sin(toRad(mid)) };
  };

  const { figure } = p;

  if (figure.type === "supplement") {
    const angle = figure.angles[0];
    const r1 = rayEnd(0);
    const r2 = rayEnd(180);
    const r3 = rayEnd(angle);
    const lbl = labelPos(0, angle, arcR + 12);
    const lbl2 = labelPos(angle, 180, arcR + 12);
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <line x1={vx} y1={vy} x2={r2.x} y2={r2.y} stroke="#333" strokeWidth={1.5} />
        <line x1={vx} y1={vy} x2={r1.x} y2={r1.y} stroke="#333" strokeWidth={1.5} />
        <line x1={vx} y1={vy} x2={r3.x} y2={r3.y} stroke="#333" strokeWidth={1.5} />
        <circle cx={vx} cy={vy} r={2.5} fill="#333" />
        <path d={arcPath(0, angle, arcR)} fill="none" stroke="#1976d2" strokeWidth={1.5} />
        <text x={lbl.x} y={lbl.y} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">{angle}°</text>
        <path d={arcPath(angle, 180, arcR)} fill="none" stroke="#d32f2f" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={lbl2.x} y={lbl2.y} textAnchor="middle" fontSize={10} fill="#d32f2f" fontWeight="bold">?</text>
      </svg>
    );
  }

  if (figure.type === "addition") {
    const [a1, a2] = figure.angles;
    const r1 = rayEnd(0);
    const r2 = rayEnd(a1);
    const r3 = rayEnd(a1 + a2);
    const lbl1 = labelPos(0, a1, arcR + 12);
    const lbl2 = labelPos(a1, a1 + a2, arcR + 12);
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <line x1={vx} y1={vy} x2={r1.x} y2={r1.y} stroke="#333" strokeWidth={1.5} />
        <line x1={vx} y1={vy} x2={r2.x} y2={r2.y} stroke="#999" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={vx} y1={vy} x2={r3.x} y2={r3.y} stroke="#333" strokeWidth={1.5} />
        <circle cx={vx} cy={vy} r={2.5} fill="#333" />
        <path d={arcPath(0, a1, arcR)} fill="none" stroke="#1976d2" strokeWidth={1.5} />
        <text x={lbl1.x} y={lbl1.y} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">{a1}°</text>
        <path d={arcPath(a1, a1 + a2, arcR + 8)} fill="none" stroke="#1976d2" strokeWidth={1.5} />
        <text x={lbl2.x} y={lbl2.y - 6} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">{a2}°</text>
      </svg>
    );
  }

  // full-rotation
  const angle = figure.angles[0];
  const r1 = rayEnd(0);
  const r2 = rayEnd(angle);
  const lbl = labelPos(0, angle, arcR + 12);
  const lbl2 = labelPos(angle, 360, arcR + 18);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      <line x1={vx} y1={vy} x2={r1.x} y2={r1.y} stroke="#333" strokeWidth={1.5} />
      <line x1={vx} y1={vy} x2={r2.x} y2={r2.y} stroke="#333" strokeWidth={1.5} />
      <circle cx={vx} cy={vy} r={2.5} fill="#333" />
      <path d={arcPath(0, angle, arcR)} fill="none" stroke="#1976d2" strokeWidth={1.5} />
      <text x={lbl.x} y={lbl.y} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">{angle}°</text>
      <path d={arcPath(angle, 359.9, arcR + 8)} fill="none" stroke="#d32f2f" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={lbl2.x} y={lbl2.y} textAnchor="middle" fontSize={10} fill="#d32f2f" fontWeight="bold">?</text>
    </svg>
  );
};

export default AngleFig;
