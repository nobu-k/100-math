import type { SolidProblem } from "../solid-volume";

const SolidVolumeFig = ({ problem }: { problem: SolidProblem }) => {
  const p = problem;
  const W = 180;
  const H = 180;

  if (p.solidType === "cylinder") {
    const cx = W / 2;
    const rx = 35;
    const ry = 10;
    const ch = 70;
    const topY = 35;
    const botY = topY + ch;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <ellipse cx={cx} cy={botY} rx={rx} ry={ry} fill="none" stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={cx - rx} y1={topY} x2={cx - rx} y2={botY} stroke="#333" strokeWidth={1.5} />
        <line x1={cx + rx} y1={topY} x2={cx + rx} y2={botY} stroke="#333" strokeWidth={1.5} />
        <path d={`M ${cx - rx} ${botY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${botY}`} fill="none" stroke="#333" strokeWidth={1.5} />
        <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill="#e8e8e8" stroke="#333" strokeWidth={1.5} />
        <line x1={cx} y1={topY} x2={cx + rx} y2={topY} stroke="#1976d2" strokeWidth={1.5} />
        <circle cx={cx} cy={topY} r={2} fill="#333" />
        <text x={cx + rx / 2} y={topY - 6} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">r={p.radius}</text>
        <text x={cx + rx + 8} y={topY + ch / 2 + 4} fontSize={9} fill="#1976d2" fontWeight="bold">h={p.height}</text>
      </svg>
    );
  }

  if (p.solidType === "cone") {
    const cx = W / 2;
    const rx = 35;
    const ry = 10;
    const ch = 80;
    const botY = H - 25;
    const topY = botY - ch;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <ellipse cx={cx} cy={botY} rx={rx} ry={ry} fill="none" stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <path d={`M ${cx - rx} ${botY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${botY}`} fill="none" stroke="#333" strokeWidth={1.5} />
        <line x1={cx - rx} y1={botY} x2={cx} y2={topY} stroke="#333" strokeWidth={1.5} />
        <line x1={cx + rx} y1={botY} x2={cx} y2={topY} stroke="#333" strokeWidth={1.5} />
        <circle cx={cx} cy={topY} r={2} fill="#333" />
        <line x1={cx} y1={topY} x2={cx} y2={botY} stroke="#333" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={cx} y1={botY} x2={cx + rx} y2={botY} stroke="#1976d2" strokeWidth={1.5} />
        <text x={cx + rx / 2} y={botY + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">r={p.radius}</text>
        <text x={cx + 10} y={topY + ch / 2} fontSize={9} fill="#1976d2" fontWeight="bold">h={p.height}</text>
        {p.slantHeight != null && (
          <text x={cx + rx / 2 + 12} y={topY + ch / 2 - 6} fontSize={9} fill="#1976d2" fontWeight="bold">l={p.slantHeight}</text>
        )}
      </svg>
    );
  }

  if (p.solidType === "sphere") {
    const cx = W / 2;
    const cy = H / 2;
    const cr = 50;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <circle cx={cx} cy={cy} r={cr} fill="none" stroke="#333" strokeWidth={1.5} />
        <ellipse cx={cx} cy={cy} rx={cr} ry={cr * 0.3} fill="none" stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={cx} y1={cy} x2={cx + cr} y2={cy} stroke="#1976d2" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={2} fill="#333" />
        <text x={cx + cr / 2} y={cy + 16} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">r={p.radius}</text>
      </svg>
    );
  }

  // Prism
  const bw = 50;
  const bh = 60;
  const bd = 35;
  const cos30 = Math.cos(Math.PI / 6);
  const sin30 = Math.sin(Math.PI / 6);
  const dx = bd * cos30;
  const dy = bd * sin30;
  const ox = 25;
  const oy = H - 25;

  if (p.baseSides === 3) {
    const fbl = { x: ox, y: oy };
    const fbr = { x: ox + bw, y: oy };
    const fap = { x: ox + bw * 0.3, y: oy - bh };
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <line x1={fbl.x} y1={fbl.y} x2={fbl.x + dx} y2={fbl.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={fbl.x + dx} y1={fbl.y - dy} x2={fbr.x + dx} y2={fbr.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={fbl.x + dx} y1={fbl.y - dy} x2={fap.x + dx} y2={fap.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <polygon points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${fap.x},${fap.y}`} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        <polygon points={`${fap.x},${fap.y} ${fap.x + dx},${fap.y - dy} ${fbr.x + dx},${fbr.y - dy} ${fbr.x},${fbr.y}`} fill="#d0d0d0" stroke="#333" strokeWidth={1.5} />
        <line x1={fap.x} y1={fap.y} x2={fap.x + dx} y2={fap.y - dy} stroke="#333" strokeWidth={1.5} />
        <text x={ox + bw / 2} y={oy + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">a={p.baseEdge}</text>
        <text x={ox + bw + dx + 6} y={oy - dy / 2} fontSize={9} fill="#1976d2" fontWeight="bold">h={p.height}</text>
      </svg>
    );
  }

  // Square prism
  const fbl = { x: ox, y: oy };
  const fbr = { x: ox + bw, y: oy };
  const ftr = { x: ox + bw, y: oy - bh };
  const ftl = { x: ox, y: oy - bh };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      <line x1={fbl.x} y1={fbl.y} x2={fbl.x + dx} y2={fbl.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={fbl.x + dx} y1={fbl.y - dy} x2={fbr.x + dx} y2={fbr.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={fbl.x + dx} y1={fbl.y - dy} x2={ftl.x + dx} y2={ftl.y - dy} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      <rect x={fbl.x} y={ftl.y} width={bw} height={bh} fill="#fff" stroke="#333" strokeWidth={1.5} />
      <polygon points={`${ftl.x},${ftl.y} ${ftl.x + dx},${ftl.y - dy} ${ftr.x + dx},${ftr.y - dy} ${ftr.x},${ftr.y}`} fill="#e8e8e8" stroke="#333" strokeWidth={1.5} />
      <polygon points={`${fbr.x},${fbr.y} ${fbr.x + dx},${fbr.y - dy} ${ftr.x + dx},${ftr.y - dy} ${ftr.x},${ftr.y}`} fill="#d0d0d0" stroke="#333" strokeWidth={1.5} />
      <text x={ox + bw / 2} y={oy + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">a={p.baseEdge}</text>
      <text x={ox + bw + dx + 6} y={oy - dy / 2} fontSize={9} fill="#1976d2" fontWeight="bold">h={p.height}</text>
    </svg>
  );
};

export default SolidVolumeFig;
