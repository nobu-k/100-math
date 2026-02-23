import type { PythagoreanProblem } from "../pythagorean";

const PythagoreanFig = ({ problem }: { problem: PythagoreanProblem }) => {
  const fig = problem.figure;

  if (fig.type === "basic") {
    const W = 180;
    const H = 140;
    const pad = 25;
    // Right triangle: right angle at B (bottom-left)
    const bx = pad;
    const by = H - pad;
    const cx2 = W - pad;
    const cy2 = H - pad;
    const ax2 = pad;
    const ay2 = pad + 10;

    const labelA = fig.unknownSide === "b" ? "?" : `${fig.b}`;
    const labelB = fig.unknownSide === "a" ? "?" : `${fig.a}`;
    const labelC = fig.unknownSide === "c" ? "?" : `${fig.c ?? "?"}`;
    const colorA = fig.unknownSide === "b" ? "#d32f2f" : "#1976d2";
    const colorB = fig.unknownSide === "a" ? "#d32f2f" : "#1976d2";
    const colorC = fig.unknownSide === "c" ? "#d32f2f" : "#1976d2";

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
          fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        {/* Right angle at B */}
        <polyline points={`${bx + 10},${by} ${bx + 10},${by - 10} ${bx},${by - 10}`}
          fill="none" stroke="#333" strokeWidth={0.8} />
        {/* Side a (bottom: B->C) */}
        <text x={(bx + cx2) / 2} y={by + 14} textAnchor="middle" fontSize={9} fill={colorB} fontWeight="bold">{labelB}</text>
        {/* Side b (left: A->B) */}
        <text x={ax2 - 10} y={(ay2 + by) / 2} textAnchor="middle" fontSize={9} fill={colorA} fontWeight="bold">{labelA}</text>
        {/* Side c (hypotenuse: A->C) */}
        <text x={(ax2 + cx2) / 2 + 10} y={(ay2 + cy2) / 2 - 6} textAnchor="middle" fontSize={9} fill={colorC} fontWeight="bold">{labelC}</text>
      </svg>
    );
  }

  if (fig.type === "special-45") {
    const W = 160;
    const H = 140;
    const pad = 25;
    const bx = pad;
    const by = H - pad;
    const cx2 = W - pad;
    const cy2 = H - pad;
    const ax2 = pad;
    const ay2 = pad + 10;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
          fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        <polyline points={`${bx + 10},${by} ${bx + 10},${by - 10} ${bx},${by - 10}`}
          fill="none" stroke="#333" strokeWidth={0.8} />
        <text x={ax2 + 14} y={ay2 + 12} fontSize={9} fill="#666">45°</text>
        <text x={cx2 - 20} y={cy2 - 6} fontSize={9} fill="#666">45°</text>
        <text x={(bx + cx2) / 2} y={by + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{fig.side}</text>
        <text x={ax2 - 10} y={(ay2 + by) / 2} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{fig.side}</text>
        <text x={(ax2 + cx2) / 2 + 10} y={(ay2 + cy2) / 2 - 6} textAnchor="middle" fontSize={9}
          fill={fig.findHypotenuse ? "#d32f2f" : "#1976d2"} fontWeight="bold">
          {fig.findHypotenuse ? "?" : `${fig.side}\u221a2`}
        </text>
      </svg>
    );
  }

  if (fig.type === "special-30-60") {
    const W = 180;
    const H = 150;
    const pad = 25;
    const bx = pad;
    const by = H - pad;
    const cx2 = W - pad;
    const cy2 = H - pad;
    const ax2 = pad;
    const ay2 = pad;
    const shortLabel = fig.findTarget === "short-leg" ? "?" : `${fig.shortSide}`;
    const longLabel = fig.findTarget === "long-leg" ? "?" : `${fig.shortSide}\u221a3`;
    const hypLabel = fig.findTarget === "hypotenuse" ? "?" : `${(fig.shortSide ?? 0) * 2}`;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
          fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        <polyline points={`${bx + 10},${by} ${bx + 10},${by - 10} ${bx},${by - 10}`}
          fill="none" stroke="#333" strokeWidth={0.8} />
        <text x={ax2 + 10} y={ay2 + 16} fontSize={9} fill="#666">60°</text>
        <text x={cx2 - 22} y={cy2 - 6} fontSize={9} fill="#666">30°</text>
        <text x={ax2 - 10} y={(ay2 + by) / 2} textAnchor="middle" fontSize={9}
          fill={fig.findTarget === "short-leg" ? "#d32f2f" : "#1976d2"} fontWeight="bold">{shortLabel}</text>
        <text x={(bx + cx2) / 2} y={by + 14} textAnchor="middle" fontSize={9}
          fill={fig.findTarget === "long-leg" ? "#d32f2f" : "#1976d2"} fontWeight="bold">{longLabel}</text>
        <text x={(ax2 + cx2) / 2 + 10} y={(ay2 + cy2) / 2 - 6} textAnchor="middle" fontSize={9}
          fill={fig.findTarget === "hypotenuse" ? "#d32f2f" : "#1976d2"} fontWeight="bold">{hypLabel}</text>
      </svg>
    );
  }

  if (fig.type === "equilateral-height") {
    const W = 180;
    const H = 160;
    const pad = 20;
    const baseW = W - pad * 2;
    const bx = pad;
    const by = H - pad;
    const cx2 = pad + baseW;
    const cy2 = H - pad;
    const mx = (bx + cx2) / 2;
    const ax2 = mx;
    const ay2 = by - baseW * 0.866;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
          fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
        {/* Height line */}
        <line x1={mx} y1={ay2} x2={mx} y2={by} stroke="#d32f2f" strokeWidth={1.2} strokeDasharray="4 3" />
        {/* Right angle at M */}
        <polyline points={`${mx + 8},${by} ${mx + 8},${by - 8} ${mx},${by - 8}`}
          fill="none" stroke="#333" strokeWidth={0.8} />
        {/* Labels */}
        <text x={bx - 4} y={by + 14} fontSize={9} fill="#333">B</text>
        <text x={cx2 + 4} y={cy2 + 14} fontSize={9} fill="#333">C</text>
        <text x={ax2} y={ay2 - 8} textAnchor="middle" fontSize={9} fill="#333">A</text>
        <text x={mx + 2} y={by + 14} textAnchor="middle" fontSize={9} fill="#333">M</text>
        <text x={(bx + ax2) / 2 - 12} y={(by + ay2) / 2} fontSize={9} fill="#1976d2" fontWeight="bold">{fig.side}</text>
        <text x={mx + 10} y={(ay2 + by) / 2} fontSize={9} fill="#d32f2f" fontWeight="bold">h=?</text>
        {/* Equal marks */}
        <line x1={(bx + ax2) / 2 - 2} y1={(by + ay2) / 2 + 4} x2={(bx + ax2) / 2 + 2} y2={(by + ay2) / 2 - 2}
          stroke="#333" strokeWidth={1} />
        <line x1={(cx2 + ax2) / 2 - 2} y1={(cy2 + ay2) / 2 + 4} x2={(cx2 + ax2) / 2 + 2} y2={(cy2 + ay2) / 2 - 2}
          stroke="#333" strokeWidth={1} />
      </svg>
    );
  }

  if (fig.type === "coordinate") {
    const W = 180;
    const H = 180;
    const pa = fig.pointA!;
    const pb = fig.pointB!;
    const allX = [pa.x, pb.x];
    const allY = [pa.y, pb.y];
    const minX = Math.min(...allX) - 1;
    const maxX = Math.max(...allX) + 1;
    const minY = Math.min(...allY) - 1;
    const maxY = Math.max(...allY) + 1;
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const pad2 = 30;
    const scale = Math.min((W - pad2 * 2) / rangeX, (H - pad2 * 2) / rangeY);
    const toSvgX = (x: number) => pad2 + (x - minX) * scale;
    const toSvgY = (y: number) => H - pad2 - (y - minY) * scale;
    const ox = toSvgX(0);
    const oy = toSvgY(0);

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        {/* Axes */}
        <line x1={pad2 - 5} y1={oy} x2={W - pad2 + 5} y2={oy} stroke="#999" strokeWidth={0.8} />
        <line x1={ox} y1={H - pad2 + 5} x2={ox} y2={pad2 - 5} stroke="#999" strokeWidth={0.8} />
        {/* Distance line */}
        <line x1={toSvgX(pa.x)} y1={toSvgY(pa.y)} x2={toSvgX(pb.x)} y2={toSvgY(pb.y)}
          stroke="#d32f2f" strokeWidth={1.5} />
        {/* Dashed right triangle */}
        <line x1={toSvgX(pa.x)} y1={toSvgY(pa.y)} x2={toSvgX(pb.x)} y2={toSvgY(pa.y)}
          stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        <line x1={toSvgX(pb.x)} y1={toSvgY(pa.y)} x2={toSvgX(pb.x)} y2={toSvgY(pb.y)}
          stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
        {/* Points */}
        <circle cx={toSvgX(pa.x)} cy={toSvgY(pa.y)} r={3} fill="#1976d2" />
        <text x={toSvgX(pa.x) - 8} y={toSvgY(pa.y) + 14} fontSize={8} fill="#1976d2">
          ({pa.x},{pa.y})
        </text>
        <circle cx={toSvgX(pb.x)} cy={toSvgY(pb.y)} r={3} fill="#1976d2" />
        <text x={toSvgX(pb.x) + 4} y={toSvgY(pb.y) - 6} fontSize={8} fill="#1976d2">
          ({pb.x},{pb.y})
        </text>
        <text x={(toSvgX(pa.x) + toSvgX(pb.x)) / 2 + 8} y={(toSvgY(pa.y) + toSvgY(pb.y)) / 2 - 4}
          fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
      </svg>
    );
  }

  // Cuboid
  const W = 200;
  const H = 160;
  const dims = fig.dims!;
  const cos30 = 0.866;
  const sin30 = 0.5;
  const sx = 0.8;
  const w = dims.a * 8;
  const h = dims.c * 8;
  const d = dims.b * 6;
  const ox = 30;
  const oy = H - 30;
  const pts2 = {
    A: { x: ox, y: oy },
    B: { x: ox + w, y: oy },
    C: { x: ox + w + d * cos30 * sx, y: oy - d * sin30 * sx },
    D: { x: ox + d * cos30 * sx, y: oy - d * sin30 * sx },
    E: { x: ox, y: oy - h },
    F: { x: ox + w, y: oy - h },
    G: { x: ox + w + d * cos30 * sx, y: oy - h - d * sin30 * sx },
    H: { x: ox + d * cos30 * sx, y: oy - h - d * sin30 * sx },
  };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      {/* Back edges (dashed) */}
      <line x1={pts2.D.x} y1={pts2.D.y} x2={pts2.A.x} y2={pts2.A.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={pts2.D.x} y1={pts2.D.y} x2={pts2.C.x} y2={pts2.C.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      <line x1={pts2.D.x} y1={pts2.D.y} x2={pts2.H.x} y2={pts2.H.y} stroke="#999" strokeWidth={0.8} strokeDasharray="4 3" />
      {/* Front face */}
      <polygon points={`${pts2.A.x},${pts2.A.y} ${pts2.B.x},${pts2.B.y} ${pts2.F.x},${pts2.F.y} ${pts2.E.x},${pts2.E.y}`}
        fill="white" stroke="#333" strokeWidth={1.2} />
      {/* Right face */}
      <polygon points={`${pts2.B.x},${pts2.B.y} ${pts2.C.x},${pts2.C.y} ${pts2.G.x},${pts2.G.y} ${pts2.F.x},${pts2.F.y}`}
        fill="#f5f5f5" stroke="#333" strokeWidth={1.2} />
      {/* Top face */}
      <polygon points={`${pts2.E.x},${pts2.E.y} ${pts2.F.x},${pts2.F.y} ${pts2.G.x},${pts2.G.y} ${pts2.H.x},${pts2.H.y}`}
        fill="#eeeeee" stroke="#333" strokeWidth={1.2} />
      {/* Space diagonal */}
      <line x1={pts2.A.x} y1={pts2.A.y} x2={pts2.G.x} y2={pts2.G.y}
        stroke="#d32f2f" strokeWidth={1.5} strokeDasharray="6 4" />
      {/* Labels */}
      <text x={(pts2.A.x + pts2.B.x) / 2} y={pts2.A.y + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{dims.a}</text>
      <text x={pts2.B.x + (pts2.C.x - pts2.B.x) / 2 + 6} y={(pts2.B.y + pts2.C.y) / 2 + 10} fontSize={9} fill="#1976d2" fontWeight="bold">{dims.b}</text>
      <text x={pts2.A.x - 12} y={(pts2.A.y + pts2.E.y) / 2} fontSize={9} fill="#1976d2" fontWeight="bold">{dims.c}</text>
      <text x={(pts2.A.x + pts2.G.x) / 2 + 8} y={(pts2.A.y + pts2.G.y) / 2} fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
    </svg>
  );
};

export default PythagoreanFig;
