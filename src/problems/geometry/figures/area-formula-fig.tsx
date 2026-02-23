import type { AreaFormulaProblem } from "../area-formula";

const AreaFormulaFig = ({ problem }: { problem: AreaFormulaProblem }) => {
  const p = problem;
  const W = 200;
  const H = 150;
  const { figure } = p;
  const pad = 30;
  const maxDim = Math.max(figure.base, figure.height, figure.upperBase ?? 0);
  const sc = Math.min((W - pad * 2) / (maxDim * 1.2), (H - pad * 2) / maxDim);
  const bw = Math.max(60, figure.base * sc);
  const fh = Math.max(40, figure.height * sc);

  if (figure.shape === "triangle") {
    const x0 = (W - bw) / 2;
    const y0 = H - pad;
    const apex = { x: x0 + bw * 0.4, y: y0 - fh };
    const pts = `${x0},${y0} ${x0 + bw},${y0} ${apex.x},${apex.y}`;
    const hx = apex.x;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={pts} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        <line x1={hx} y1={y0} x2={hx} y2={apex.y} stroke="#333" strokeWidth={1} strokeDasharray="4 3" />
        <rect x={hx - 5} y={y0 - 5} width={5} height={5} fill="none" stroke="#333" strokeWidth={0.8} />
        <text x={x0 + bw / 2} y={y0 + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          底辺 = {figure.base}cm
        </text>
        <text x={hx + 10} y={y0 - fh / 2 + 4} textAnchor="start" fontSize={10} fill="#1976d2" fontWeight="bold">
          高さ = {figure.height}cm
        </text>
      </svg>
    );
  }

  if (figure.shape === "parallelogram") {
    const slant = fh * 0.35;
    const x0 = (W - bw - slant) / 2;
    const y0 = H - pad;
    const pts = `${x0},${y0} ${x0 + bw},${y0} ${x0 + bw + slant},${y0 - fh} ${x0 + slant},${y0 - fh}`;
    const hx = x0 + slant;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={pts} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        <line x1={hx} y1={y0} x2={hx} y2={y0 - fh} stroke="#333" strokeWidth={1} strokeDasharray="4 3" />
        <rect x={hx - 5} y={y0 - 5} width={5} height={5} fill="none" stroke="#333" strokeWidth={0.8} />
        <text x={x0 + bw / 2} y={y0 + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          底辺 = {figure.base}cm
        </text>
        <text x={hx + 10} y={y0 - fh / 2 + 4} textAnchor="start" fontSize={10} fill="#1976d2" fontWeight="bold">
          高さ = {figure.height}cm
        </text>
      </svg>
    );
  }

  // trapezoid
  const uw = Math.max(30, (figure.upperBase ?? 0) * sc);
  const x0 = (W - bw) / 2;
  const y0 = H - pad;
  const topLeft = x0 + (bw - uw) * 0.3;
  const pts = `${x0},${y0} ${x0 + bw},${y0} ${topLeft + uw},${y0 - fh} ${topLeft},${y0 - fh}`;
  const hx = topLeft;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      <polygon points={pts} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
      <line x1={hx} y1={y0} x2={hx} y2={y0 - fh} stroke="#333" strokeWidth={1} strokeDasharray="4 3" />
      <rect x={hx - 5} y={y0 - 5} width={5} height={5} fill="none" stroke="#333" strokeWidth={0.8} />
      <text x={x0 + bw / 2} y={y0 + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
        下底 = {figure.base}cm
      </text>
      <text x={topLeft + uw / 2} y={y0 - fh - 8} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
        上底 = {figure.upperBase}cm
      </text>
      <text x={hx - 8} y={y0 - fh / 2 + 4} textAnchor="end" fontSize={10} fill="#1976d2" fontWeight="bold">
        高さ = {figure.height}cm
      </text>
    </svg>
  );
};

export default AreaFormulaFig;
