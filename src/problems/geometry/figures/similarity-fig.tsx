import type { SimilarityProblem } from "../similarity";

const SimilarityFig = ({ problem }: { problem: SimilarityProblem }) => {
  const fig = problem.figure;

  if (fig.type === "similar-triangles") {
    const W = 260;
    const H = 130;
    const rA = fig.ratioA ?? 2;
    const rB = fig.ratioB ?? 3;
    const maxR = Math.max(rA, rB);
    const s1 = (rA / maxR) * 50;
    const s2 = (rB / maxR) * 50;
    // Small triangle
    const t1bx = 20;
    const t1by = H - 20;
    const t1cx = t1bx + s1 * 1.6;
    const t1cy = t1by;
    const t1ax = t1bx + s1 * 0.5;
    const t1ay = t1by - s1 * 1.2;
    // Large triangle
    const gap = 40;
    const t2bx = t1cx + gap;
    const t2by = H - 20;
    const t2cx = t2bx + s2 * 1.6;
    const t2cy = t2by;
    const t2ax = t2bx + s2 * 0.5;
    const t2ay = t2by - s2 * 1.2;

    const isFillArea = fig.findTarget === "area";

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={`${t1ax},${t1ay} ${t1bx},${t1by} ${t1cx},${t1cy}`}
          fill={isFillArea ? "#bbdefb" : "#e3f2fd"} stroke="#333" strokeWidth={1.2} />
        <polygon points={`${t2ax},${t2ay} ${t2bx},${t2by} ${t2cx},${t2cy}`}
          fill={isFillArea ? "#e3f2fd" : "#e3f2fd"} stroke="#333" strokeWidth={1.2} />
        {/* Labels */}
        <text x={t1ax} y={t1ay - 4} textAnchor="middle" fontSize={8} fill="#333">A</text>
        <text x={t1bx - 4} y={t1by + 10} fontSize={8} fill="#333">B</text>
        <text x={t1cx + 4} y={t1cy + 10} fontSize={8} fill="#333">C</text>
        <text x={t2ax} y={t2ay - 4} textAnchor="middle" fontSize={8} fill="#333">D</text>
        <text x={t2bx - 4} y={t2by + 10} fontSize={8} fill="#333">E</text>
        <text x={t2cx + 4} y={t2cy + 10} fontSize={8} fill="#333">F</text>
        {/* Ratio label */}
        <text x={(t1cx + t2bx) / 2} y={20} textAnchor="middle" fontSize={9} fill="#666">
          {rA}:{rB}
        </text>
      </svg>
    );
  }

  if (fig.type === "parallel-line") {
    const W = 200;
    const H = 160;
    const pad = 15;
    // Triangle ABC
    const bx = pad;
    const by = H - pad;
    const cx2 = W - pad;
    const cy2 = H - pad;
    const ax2 = pad + 60;
    const ay2 = pad + 10;
    // D on AB, E on AC, ratio m:n
    const m = fig.m ?? 1;
    const n = fig.n ?? 2;
    const t = m / (m + n);
    const dx = ax2 + (bx - ax2) * t;
    const dy = ay2 + (by - ay2) * t;
    const ex = ax2 + (cx2 - ax2) * t;
    const ey = ay2 + (cy2 - ay2) * t;

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
        <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
          fill="#e3f2fd" stroke="#333" strokeWidth={1.2} />
        {/* DE parallel to BC */}
        <line x1={dx} y1={dy} x2={ex} y2={ey} stroke="#1976d2" strokeWidth={1.5} />
        {/* Parallel marks */}
        <text x={(dx + ex) / 2} y={(dy + ey) / 2 - 5} textAnchor="middle" fontSize={7} fill="#1976d2">{"\u25b8\u25b8"}</text>
        <text x={(bx + cx2) / 2} y={(by + cy2) / 2 - 5} textAnchor="middle" fontSize={7} fill="#333">{"\u25b8\u25b8"}</text>
        {/* Labels */}
        <text x={ax2} y={ay2 - 6} textAnchor="middle" fontSize={9} fill="#333">A</text>
        <text x={bx - 6} y={by + 4} fontSize={9} fill="#333">B</text>
        <text x={cx2 + 4} y={cy2 + 4} fontSize={9} fill="#333">C</text>
        <text x={dx - 10} y={dy + 4} fontSize={9} fill="#333">D</text>
        <text x={ex + 6} y={ey + 4} fontSize={9} fill="#333">E</text>
        {/* Segment labels */}
        <text x={(ax2 + dx) / 2 - 14} y={(ay2 + dy) / 2} fontSize={8} fill="#1976d2" fontWeight="bold">{m}</text>
        <text x={(dx + bx) / 2 - 14} y={(dy + by) / 2} fontSize={8} fill="#1976d2" fontWeight="bold">{n}</text>
        <text x={(ax2 + ex) / 2 + 10} y={(ay2 + ey) / 2} fontSize={8} fill="#1976d2" fontWeight="bold">{fig.ae}</text>
        <text x={(ex + cx2) / 2 + 10} y={(ey + cy2) / 2} fontSize={8} fill="#d32f2f" fontWeight="bold">?</text>
      </svg>
    );
  }

  // Midpoint
  const W = 200;
  const H = 160;
  const pad = 15;
  const bx = pad;
  const by = H - pad;
  const cx2 = W - pad;
  const cy2 = H - pad;
  const ax2 = pad + 60;
  const ay2 = pad + 10;
  const mx = (ax2 + bx) / 2;
  const my = (ay2 + by) / 2;
  const nx = (ax2 + cx2) / 2;
  const ny = (ay2 + cy2) / 2;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      <polygon points={`${ax2},${ay2} ${bx},${by} ${cx2},${cy2}`}
        fill="#e3f2fd" stroke="#333" strokeWidth={1.2} />
      {/* MN line */}
      <line x1={mx} y1={my} x2={nx} y2={ny} stroke="#1976d2" strokeWidth={1.5} />
      {/* Midpoint dots */}
      <circle cx={mx} cy={my} r={3} fill="#1976d2" />
      <circle cx={nx} cy={ny} r={3} fill="#1976d2" />
      {/* Equal marks on AM, MB */}
      {[[ax2, ay2, mx, my], [mx, my, bx, by]].map(([x1, y1, x2, y2], i) => {
        const mmx = (x1 + x2) / 2;
        const mmy = (y1 + y2) / 2;
        const ddx = x2 - x1;
        const ddy = y2 - y1;
        const len = Math.sqrt(ddx * ddx + ddy * ddy);
        return <line key={`am${i}`} x1={mmx - ddy / len * 4} y1={mmy + ddx / len * 4}
          x2={mmx + ddy / len * 4} y2={mmy - ddx / len * 4} stroke="#333" strokeWidth={1} />;
      })}
      {/* Equal marks on AN, NC */}
      {[[ax2, ay2, nx, ny], [nx, ny, cx2, cy2]].map(([x1, y1, x2, y2], i) => {
        const mmx = (x1 + x2) / 2;
        const mmy = (y1 + y2) / 2;
        const ddx = x2 - x1;
        const ddy = y2 - y1;
        const len = Math.sqrt(ddx * ddx + ddy * ddy);
        return <line key={`an${i}`} x1={mmx - ddy / len * 4} y1={mmy + ddx / len * 4}
          x2={mmx + ddy / len * 4} y2={mmy - ddx / len * 4} stroke="#333" strokeWidth={1} />;
      })}
      {/* Labels */}
      <text x={ax2} y={ay2 - 6} textAnchor="middle" fontSize={9} fill="#333">A</text>
      <text x={bx - 6} y={by + 4} fontSize={9} fill="#333">B</text>
      <text x={cx2 + 4} y={cy2 + 4} fontSize={9} fill="#333">C</text>
      <text x={mx - 10} y={my + 4} fontSize={9} fill="#333">M</text>
      <text x={nx + 6} y={ny + 4} fontSize={9} fill="#333">N</text>
      {/* BC label */}
      <text x={(bx + cx2) / 2} y={by + 14} textAnchor="middle" fontSize={9} fill="#1976d2" fontWeight="bold">{fig.bc}</text>
      {/* MN label */}
      <text x={(mx + nx) / 2} y={(my + ny) / 2 - 6} textAnchor="middle" fontSize={9} fill="#d32f2f" fontWeight="bold">?</text>
    </svg>
  );
};

export default SimilarityFig;
