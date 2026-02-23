import type { CircleAngleProblem } from "../circle-angle";

const CircleAngleFig = ({ problem }: { problem: CircleAngleProblem }) => {
  const p = problem;
  const W = 200;
  const H = 180;
  const cx = W / 2;
  const cy = H / 2;
  const r = 65;
  const toRad = (d: number) => (d * Math.PI) / 180;

  if (p.figure.type === "central-inscribed") {
    // Points A and B on circle (arc at top)
    const aAngle = -70; // degrees from right
    const bAngle = -110;
    const ax = cx + r * Math.cos(toRad(aAngle));
    const ay = cy + r * Math.sin(toRad(aAngle));
    const bx = cx + r * Math.cos(toRad(bAngle));
    const by = cy + r * Math.sin(toRad(bAngle));
    // Point P on major arc (bottom)
    const pAngle = 90;
    const px = cx + r * Math.cos(toRad(pAngle));
    const py = cy + r * Math.sin(toRad(pAngle));

    const centralLabel = p.figure.findTarget === "central"
      ? "?" : `${p.figure.centralAngle}°`;
    const inscribedLabel = p.figure.findTarget === "inscribed"
      ? "?" : `${p.figure.inscribedAngle}°`;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#333" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={2} fill="#333" />
        <text x={cx + 6} y={cy - 4} fontSize={8} fill="#666">O</text>
        {/* OA and OB (central angle) */}
        <line x1={cx} y1={cy} x2={ax} y2={ay} stroke="#1976d2" strokeWidth={1.2} />
        <line x1={cx} y1={cy} x2={bx} y2={by} stroke="#1976d2" strokeWidth={1.2} />
        {/* PA and PB (inscribed angle) */}
        <line x1={px} y1={py} x2={ax} y2={ay} stroke="#d32f2f" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={px} y1={py} x2={bx} y2={by} stroke="#d32f2f" strokeWidth={1} strokeDasharray="4 3" />
        {/* Point labels */}
        <circle cx={ax} cy={ay} r={2.5} fill="#333" />
        <text x={ax + 6} y={ay - 4} fontSize={9} fill="#333">A</text>
        <circle cx={bx} cy={by} r={2.5} fill="#333" />
        <text x={bx - 14} y={by - 4} fontSize={9} fill="#333">B</text>
        <circle cx={px} cy={py} r={2.5} fill="#333" />
        <text x={px + 6} y={py + 4} fontSize={9} fill="#333">P</text>
        {/* Central angle label */}
        <text x={cx} y={cy - 14} textAnchor="middle" fontSize={9}
          fill={p.figure.findTarget === "central" ? "#d32f2f" : "#1976d2"} fontWeight="bold">
          {centralLabel}
        </text>
        {/* Inscribed angle label */}
        <text x={px} y={py - 10} textAnchor="middle" fontSize={9}
          fill={p.figure.findTarget === "inscribed" ? "#d32f2f" : "#1976d2"} fontWeight="bold">
          {inscribedLabel}
        </text>
      </svg>
    );
  }

  if (p.figure.type === "semicircle") {
    // Diameter BC horizontal, point A on top
    const bx = cx - r;
    const by = cy;
    const ccx = cx + r;
    const ccy = cy;
    // Point A on semicircle top
    const aAngle = p.figure.otherAngle ? -(90 - p.figure.otherAngle) : -45;
    const aax = cx + r * Math.cos(toRad(aAngle));
    const aay = cy + r * Math.sin(toRad(aAngle));

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#333" strokeWidth={1.5} />
        {/* Diameter */}
        <line x1={bx} y1={by} x2={ccx} y2={ccy} stroke="#333" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={2} fill="#333" />
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8} fill="#666">O</text>
        {/* Triangle */}
        <line x1={bx} y1={by} x2={aax} y2={aay} stroke="#1976d2" strokeWidth={1.2} />
        <line x1={ccx} y1={ccy} x2={aax} y2={aay} stroke="#1976d2" strokeWidth={1.2} />
        {/* Right angle at A */}
        <rect x={aax - 3} y={aay - 3} width={6} height={6}
          fill="none" stroke="#d32f2f" strokeWidth={0.8}
          transform={`rotate(${aAngle + 45}, ${aax}, ${aay})`} />
        {/* Labels */}
        <circle cx={bx} cy={by} r={2.5} fill="#333" />
        <text x={bx - 10} y={by + 4} fontSize={9} fill="#333">B</text>
        <circle cx={ccx} cy={ccy} r={2.5} fill="#333" />
        <text x={ccx + 6} y={ccy + 4} fontSize={9} fill="#333">C</text>
        <circle cx={aax} cy={aay} r={2.5} fill="#333" />
        <text x={aax} y={aay - 10} textAnchor="middle" fontSize={9} fill="#333">A</text>
        <text x={aax + 10} y={aay + 4} fontSize={9} fill="#d32f2f" fontWeight="bold">90°</text>
        {p.figure.otherAngle && (
          <text x={bx + 18} y={by - 6} fontSize={9} fill="#1976d2" fontWeight="bold">{p.figure.otherAngle}°</text>
        )}
      </svg>
    );
  }

  // Inscribed quadrilateral
  const pts = [0, 1, 2, 3].map((i) => {
    const angle = -90 + i * 90 + (i % 2 === 0 ? 15 : -15);
    return { x: cx + r * Math.cos(toRad(angle)), y: cy + r * Math.sin(toRad(angle)) };
  });
  const labels = ["A", "B", "C", "D"];
  const givenIdx = labels.indexOf(p.figure.givenVertex ?? "A");
  const oppositeIdx = (givenIdx + 2) % 4;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#333" strokeWidth={1.5} />
      <polygon points={pts.map((pt) => `${pt.x},${pt.y}`).join(" ")}
        fill="#e3f2fd" stroke="#333" strokeWidth={1.2} />
      {pts.map((pt, i) => {
        const dx = pt.x - cx;
        const dy = pt.y - cy;
        const len = Math.sqrt(dx * dx + dy * dy);
        const lx = pt.x + (dx / len) * 14;
        const ly = pt.y + (dy / len) * 14;
        return (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={2} fill="#333" />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize={9} fill="#333">{labels[i]}</text>
            {i === givenIdx && (
              <text x={pt.x + (dx > 0 ? 8 : -8)} y={pt.y + (dy > 0 ? 16 : -6)}
                textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{p.figure.givenAngle}°</text>
            )}
            {i === oppositeIdx && (
              <text x={pt.x + (dx > 0 ? 8 : -8)} y={pt.y + (dy > 0 ? 16 : -6)}
                textAnchor="middle" fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default CircleAngleFig;
