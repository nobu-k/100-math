import React, { useState, useCallback, useMemo } from "react";
import { M } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { type CoordinateProblem, type CoordinateMode, generateCoordinate } from "./coordinate";

const DEF = { comode: "mixed" as CoordinateMode };
const PARAM_KEYS = ["comode"];

const renderCoordinateFigure = (p: CoordinateProblem) => {
  const W = 200; const H = 200;
  const cx = W / 2; const cy = H / 2;
  const axisLen = 80; const scale = 8;
  const toSvgX = (v: number) => cx + v * scale;
  const toSvgY = (v: number) => cy - v * scale;
  const gridLines: React.ReactNode[] = [];
  for (let v = -8; v <= 8; v += 2) {
    if (v === 0) continue;
    gridLines.push(
      <line key={`gx${v}`} x1={toSvgX(v)} y1={cy - axisLen} x2={toSvgX(v)} y2={cy + axisLen} stroke="#eee" strokeWidth={0.5} />,
      <line key={`gy${v}`} x1={cx - axisLen} y1={toSvgY(v)} x2={cx + axisLen} y2={toSvgY(v)} stroke="#eee" strokeWidth={0.5} />,
    );
  }
  const px = toSvgX(p.x); const py = toSvgY(p.y);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "8px 0" }}>
      {gridLines}
      <line x1={cx - axisLen} y1={cy} x2={cx + axisLen} y2={cy} stroke="#333" strokeWidth={1} />
      <line x1={cx} y1={cy + axisLen} x2={cx} y2={cy - axisLen} stroke="#333" strokeWidth={1} />
      <polygon points={`${cx + axisLen},${cy} ${cx + axisLen - 5},${cy - 3} ${cx + axisLen - 5},${cy + 3}`} fill="#333" />
      <polygon points={`${cx},${cy - axisLen} ${cx - 3},${cy - axisLen + 5} ${cx + 3},${cy - axisLen + 5}`} fill="#333" />
      <text x={cx + axisLen + 4} y={cy + 4} fontSize={10} fill="#333">x</text>
      <text x={cx + 4} y={cy - axisLen - 2} fontSize={10} fill="#333">y</text>
      <text x={cx - 10} y={cy + 12} fontSize={9} fill="#333">O</text>
      <text x={cx + 35} y={cy - 35} textAnchor="middle" fontSize={10} fill="#ddd">I</text>
      <text x={cx - 35} y={cy - 35} textAnchor="middle" fontSize={10} fill="#ddd">II</text>
      <text x={cx - 35} y={cy + 42} textAnchor="middle" fontSize={10} fill="#ddd">III</text>
      <text x={cx + 35} y={cy + 42} textAnchor="middle" fontSize={10} fill="#ddd">IV</text>
      {p.type === "on-graph" && p.formulaA != null && (
        <>
          <line x1={toSvgX(-8)} y1={toSvgY(-8 * p.formulaA)} x2={toSvgX(8)} y2={toSvgY(8 * p.formulaA)}
            stroke="#1976d2" strokeWidth={1} opacity={0.6} clipPath="url(#coordClip)" />
          <defs>
            <clipPath id="coordClip">
              <rect x={cx - axisLen} y={cy - axisLen} width={axisLen * 2} height={axisLen * 2} />
            </clipPath>
          </defs>
        </>
      )}
      <circle cx={px} cy={py} r={4} fill="#d32f2f" />
      <text x={px + 6} y={py - 6} fontSize={10} fill="#d32f2f" fontWeight="bold">({p.x}, {p.y})</text>
    </svg>
  );
};

const Coordinate = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const comodeRaw = p.get("comode") ?? DEF.comode;
    const comode = (["mixed", "quadrant", "on-graph"] as const).includes(comodeRaw as any)
      ? (comodeRaw as CoordinateMode)
      : DEF.comode;
    return { comode };
  });

  const [comode, setComode] = useState(initial.comode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (comode !== DEF.comode) m.comode = comode;
    return m;
  }, [comode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onComodeChange = useCallback(
    (v: CoordinateMode) => {
      setComode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.comode) p.comode = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateCoordinate(seed, comode), [seed, comode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={comode}
          onChange={(e) => onComodeChange(e.target.value as CoordinateMode)}>
          <option value="mixed">すべて</option>
          <option value="quadrant">象限の判定</option>
          <option value="on-graph">グラフ上の点</option>
        </select>
      </label>
    </div>
  );

  return (
    <ProblemPageLayout
      showAnswers={showAnswers}
      showSettings={showSettings}
      handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers}
      setShowSettings={setShowSettings}
      settingsPanel={settingsPanel}
      qrUrl={qrUrl}
    >
      <div className="dev-fig-page">
        {problems.map((p, i) => (
          <div key={i} className="dev-prop-block">
            <div className="dev-prop-label">({i + 1})</div>
            {renderCoordinateFigure(p)}
            <div style={{ marginTop: 8 }}>
              <div className="dev-text-row">
                <span className="dev-text-q">
                  {p.type === "quadrant"
                    ? `点 (${p.x}, ${p.y}) は第何象限？`
                    : <><M tex={unicodeToLatex(p.formula!)} /> のグラフは点 ({p.x}, {p.y}) を通るか？</>}
                </span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answerDisplay}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default Coordinate;
