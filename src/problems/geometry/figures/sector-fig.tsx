import type { SectorProblem } from "../sector";

const SectorFig = ({ problem }: { problem: SectorProblem }) => {
  const p = problem;
  const W = 160;
  const H = 160;
  const cx = 30;
  const cy = H - 20;
  const r = 100;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const angle = p.angle;

  const ex = cx + r * Math.cos(toRad(angle));
  const ey = cy - r * Math.sin(toRad(angle));
  const largeArc = angle > 180 ? 1 : 0;

  const arcPath = `M ${cx + r} ${cy} A ${r} ${r} 0 ${largeArc} 0 ${ex} ${ey}`;
  const sectorPath = `M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 ${largeArc} 0 ${ex} ${ey} Z`;

  const arcR = 20;
  const arcLabelAngle = angle / 2;
  const arcLx = cx + (arcR + 12) * Math.cos(toRad(arcLabelAngle));
  const arcLy = cy - (arcR + 12) * Math.sin(toRad(arcLabelAngle));

  return (
    <svg width={W + 15} height={H} viewBox={`-15 0 ${W + 15} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      {/* Filled sector for area type */}
      {p.type === "area" && (
        <path d={sectorPath} fill="#e3f2fd" stroke="none" />
      )}
      {/* Two radii */}
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#333" strokeWidth={1.5} />
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#333" strokeWidth={1.5} />
      {/* Arc */}
      <path d={arcPath} fill="none"
        stroke={p.type === "arc" ? "#d32f2f" : "#333"}
        strokeWidth={p.type === "arc" ? 2.5 : 1.5} />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={2.5} fill="#333" />
      {/* Angle arc */}
      <path
        d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${cx + arcR * Math.cos(toRad(angle))} ${cy - arcR * Math.sin(toRad(angle))}`}
        fill="none" stroke="#666" strokeWidth={0.8} />
      <text x={arcLx} y={arcLy + 3} textAnchor="middle" fontSize={9} fill="#333">{angle}°</text>
      {/* Radius label */}
      <text x={cx + r / 2} y={cy + 14} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
        r = {p.radius}cm
      </text>
    </svg>
  );
};

export default SectorFig;
