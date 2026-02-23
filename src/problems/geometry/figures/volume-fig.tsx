import type { VolumeProblem } from "../volume";

const VolumeFig = ({ problem }: { problem: VolumeProblem }) => {
  const p = problem;
  const W = 200;
  const H = 170;
  const { figure } = p;
  const maxDim = Math.max(figure.width, figure.height, figure.depth);
  const sc = Math.min(80 / maxDim, 12);
  const fw = Math.max(30, figure.width * sc);
  const fh = Math.max(30, figure.height * sc);
  const fd = Math.max(20, figure.depth * sc * 0.6);
  const cos30 = Math.cos(Math.PI / 6);
  const sin30 = Math.sin(Math.PI / 6);
  const dx = fd * cos30;
  const dy = fd * sin30;

  // Front-bottom-left corner
  const ox = 30;
  const oy = H - 25;

  // 8 corners: front face + back face
  const fbl = { x: ox, y: oy };
  const fbr = { x: ox + fw, y: oy };
  const ftr = { x: ox + fw, y: oy - fh };
  const ftl = { x: ox, y: oy - fh };
  const bbl = { x: ox + dx, y: oy - dy };
  const bbr = { x: ox + fw + dx, y: oy - dy };
  const btr = { x: ox + fw + dx, y: oy - fh - dy };
  const btl = { x: ox + dx, y: oy - fh - dy };

  const isCube = figure.shape === "cube";

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      {/* Hidden edges (dashed) */}
      <line x1={fbl.x} y1={fbl.y} x2={bbl.x} y2={bbl.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={bbl.x} y1={bbl.y} x2={bbr.x} y2={bbr.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={bbl.x} y1={bbl.y} x2={btl.x} y2={btl.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      {/* Front face */}
      <polygon points={`${fbl.x},${fbl.y} ${fbr.x},${fbr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`}
        fill="#fff" stroke="#333" strokeWidth={1.5} />
      {/* Top face */}
      <polygon points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`}
        fill="#e8e8e8" stroke="#333" strokeWidth={1.5} />
      {/* Right face */}
      <polygon points={`${fbr.x},${fbr.y} ${bbr.x},${bbr.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`}
        fill="#d0d0d0" stroke="#333" strokeWidth={1.5} />
      {/* Labels */}
      {isCube ? (
        <text x={ox + fw / 2} y={oy + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
          一辺 = {figure.width}cm
        </text>
      ) : (
        <>
          <text x={ox + fw / 2} y={oy + 16} textAnchor="middle" fontSize={10} fill="#1976d2" fontWeight="bold">
            よこ = {figure.width}cm
          </text>
          <text x={ox - 8} y={oy - fh / 2 + 4} textAnchor="end" fontSize={10} fill="#1976d2" fontWeight="bold">
            高さ = {figure.height}cm
          </text>
          <text x={ox + fw + dx / 2 + 8} y={oy - dy / 2 + 4} textAnchor="start" fontSize={10} fill="#1976d2" fontWeight="bold">
            たて = {figure.depth}cm
          </text>
        </>
      )}
    </svg>
  );
};

export default VolumeFig;
