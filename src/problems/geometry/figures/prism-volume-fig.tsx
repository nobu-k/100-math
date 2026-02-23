import type { PrismVolumeProblem } from "../prism-volume";

const PrismVolumeFig = ({ problem }: { problem: PrismVolumeProblem }) => {
  const p = problem;
  const W = 200;
  const H = 180;
  const { figure } = p;

  if (figure.shape === "cylinder") {
    const cx = W / 2;
    const rx = 40;
    const ry = 12;
    const ch = 80;
    const topY = 35;
    const botY = topY + ch;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {/* Bottom ellipse back half (dashed) */}
        <ellipse cx={cx} cy={botY} rx={rx} ry={ry} fill="none" stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        {/* Side lines */}
        <line x1={cx - rx} y1={topY} x2={cx - rx} y2={botY} stroke="#333" strokeWidth={1.5} />
        <line x1={cx + rx} y1={topY} x2={cx + rx} y2={botY} stroke="#333" strokeWidth={1.5} />
        {/* Bottom ellipse front half */}
        <path d={`M ${cx - rx} ${botY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${botY}`}
          fill="none" stroke="#333" strokeWidth={1.5} />
        {/* Top ellipse (full) */}
        <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill="#e8e8e8" stroke="#333" strokeWidth={1.5} />
        {/* Radius line on top */}
        <line x1={cx} y1={topY} x2={cx + rx} y2={topY} stroke="#1976d2" strokeWidth={1.5} />
        <circle cx={cx} cy={topY} r={2} fill="#333" />
        <text x={cx + rx / 2} y={topY - 6} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          半径 = {figure.radius}cm
        </text>
        {/* Height label */}
        <text x={cx + rx + 10} y={topY + ch / 2 + 4} textAnchor="start" fontSize={10} fill="#1976d2" fontWeight="bold">
          高さ = {figure.height}cm
        </text>
      </svg>
    );
  }

  if (figure.shape === "triangular-prism") {
    const bw = 60;
    const th = 50;
    const depth = 50;
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);
    const dx = depth * cos30 * 0.5;
    const dy = depth * sin30 * 0.5;
    const ox = 30;
    const oy = H - 25;
    // Front triangle: bottom-left, bottom-right, apex
    const fbl = { x: ox, y: oy };
    const fbr = { x: ox + bw, y: oy };
    const fap = { x: ox + bw * 0.3, y: oy - th };
    // Back triangle
    const bbl = { x: fbl.x + dx, y: fbl.y - dy };
    const bbr = { x: fbr.x + dx, y: fbr.y - dy };
    const bap = { x: fap.x + dx, y: fap.y - dy };
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {/* Hidden edges */}
        <line x1={fbl.x} y1={fbl.y} x2={bbl.x} y2={bbl.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={bbl.x} y1={bbl.y} x2={bbr.x} y2={bbr.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={bbl.x} y1={bbl.y} x2={bap.x} y2={bap.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        {/* Front face */}
        <polygon points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${fap.x},${fap.y}`}
          fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        {/* Top face */}
        <polygon points={`${fap.x},${fap.y} ${bap.x},${bap.y} ${bbr.x},${bbr.y} ${fbr.x},${fbr.y}`}
          fill="#d0d0d0" stroke="#333" strokeWidth={1.5} />
        {/* Right face */}
        <line x1={fbr.x} y1={fbr.y} x2={bbr.x} y2={bbr.y} stroke="#333" strokeWidth={1.5} />
        {/* Height line on front triangle */}
        <line x1={fap.x} y1={fap.y} x2={fap.x} y2={oy} stroke="#333" strokeWidth={1} strokeDasharray="4 3" />
        <rect x={fap.x - 4} y={oy - 4} width={4} height={4} fill="none" stroke="#333" strokeWidth={0.8} />
        {/* Labels */}
        <text x={ox + bw / 2} y={oy + 16} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">
          底辺 = {figure.base}cm
        </text>
        <text x={fap.x + 10} y={oy - th / 2} textAnchor="start" fontSize={9} fill="#1976d2" fontWeight="bold">
          高さ = {figure.triangleHeight}cm
        </text>
        <text x={fbr.x + dx / 2 + 8} y={fbr.y - dy / 2 + 4} textAnchor="start" fontSize={9} fill="#1976d2" fontWeight="bold">
          奥行 = {figure.height}cm
        </text>
      </svg>
    );
  }

  // Generic prism (box representation)
  const bw = 80;
  const bh = 60;
  const bd = 30;
  const cos30 = Math.cos(Math.PI / 6);
  const sin30 = Math.sin(Math.PI / 6);
  const dx = bd * cos30;
  const dy = bd * sin30;
  const ox = 30;
  const oy = H - 30;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      {/* Hidden edges */}
      <line x1={ox} y1={oy} x2={ox + dx} y2={oy - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={ox + dx} y1={oy - dy} x2={ox + bw + dx} y2={oy - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={ox + dx} y1={oy - dy} x2={ox + dx} y2={oy - bh - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      {/* Front face */}
      <rect x={ox} y={oy - bh} width={bw} height={bh} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
      {/* Top face */}
      <polygon points={`${ox},${oy - bh} ${ox + dx},${oy - bh - dy} ${ox + bw + dx},${oy - bh - dy} ${ox + bw},${oy - bh}`}
        fill="#d0e8f7" stroke="#333" strokeWidth={1.5} />
      {/* Right face */}
      <polygon points={`${ox + bw},${oy} ${ox + bw + dx},${oy - dy} ${ox + bw + dx},${oy - bh - dy} ${ox + bw},${oy - bh}`}
        fill="#c0d8e7" stroke="#333" strokeWidth={1.5} />
      {/* Labels */}
      <text x={ox + bw / 2} y={oy - bh / 2 + 4} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
        底面積 = {figure.baseArea}cm²
      </text>
      <text x={ox + bw + dx + 8} y={oy - dy - bh / 2 + 4} textAnchor="start" fontSize={10} fill="#1976d2" fontWeight="bold">
        高さ = {figure.height}cm
      </text>
    </svg>
  );
};

export default PrismVolumeFig;
