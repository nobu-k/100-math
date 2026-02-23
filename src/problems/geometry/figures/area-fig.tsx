import type { AreaProblem } from "../area";

const AreaFig = ({ problem }: { problem: AreaProblem }) => {
  const p = problem;
  const W = 200;
  const H = 150;
  const pad = 30;
  const { figure } = p;

  const maxDim = Math.max(figure.width, figure.height);
  const scale = Math.min((W - pad * 2) / maxDim, (H - pad * 2) / maxDim);
  const rw = Math.max(40, figure.width * scale);
  const rh = Math.max(40, figure.height * scale);
  const rx = (W - rw) / 2;
  const ry = (H - rh) / 2;

  const widthLabel = figure.unknown === "width" ? "?" : `${figure.width}cm`;
  const heightLabel = figure.unknown === "height" ? "?" : `${figure.height}cm`;
  const widthColor = figure.unknown === "width" ? "#d32f2f" : "#1976d2";
  const heightColor = figure.unknown === "height" ? "#d32f2f" : "#1976d2";

  const sideLabel = figure.shape === "square"
    ? (figure.unknown === "area" ? `一辺 ${figure.width}cm` : "一辺 = ?")
    : null;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", margin: "8px 0" }}
    >
      {/* Rectangle */}
      <rect x={rx} y={ry} width={rw} height={rh} fill="#e3f2fd" stroke="#333" strokeWidth={1.5} />
      {/* Right angle mark */}
      <polyline
        points={`${rx + 10},${ry + rh} ${rx + 10},${ry + rh - 10} ${rx},${ry + rh - 10}`}
        fill="none" stroke="#333" strokeWidth={1}
      />
      {figure.shape === "square" ? (
        <>
          {/* Single label for square */}
          <text x={rx + rw / 2} y={ry + rh + 18} textAnchor="middle" fontSize={11}
            fill={figure.unknown === "area" ? "#1976d2" : "#d32f2f"} fontWeight="bold">
            {sideLabel}
          </text>
          {/* Equal marks on sides */}
          <line x1={rx + rw / 2 - 4} y1={ry + rh + 3} x2={rx + rw / 2 + 4} y2={ry + rh + 3}
            stroke="#333" strokeWidth={1} />
          <line x1={rx + rw + 3} y1={ry + rh / 2 - 4} x2={rx + rw + 3} y2={ry + rh / 2 + 4}
            stroke="#333" strokeWidth={1} />
        </>
      ) : (
        <>
          {/* Width label (bottom) */}
          <text x={rx + rw / 2} y={ry + rh + 18} textAnchor="middle" fontSize={11}
            fill={widthColor} fontWeight="bold">
            よこ = {widthLabel}
          </text>
          {/* Height label (right) */}
          <text x={rx + rw + 8} y={ry + rh / 2 + 4} textAnchor="start" fontSize={11}
            fill={heightColor} fontWeight="bold">
            たて = {heightLabel}
          </text>
        </>
      )}
    </svg>
  );
};

export default AreaFig;
