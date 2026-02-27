import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type CoordGeometryMode, generateCoordGeometry } from "./coord-geometry";
import { renderExprProblems } from "../equations/renderExprProblems";

const DEF = { mode: "mixed" as CoordGeometryMode };
const PARAM_KEYS = ["mode"];

const CoordGeometry = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { mode: parseEnum(p.get("mode"), ["distance", "division", "line-eq", "point-line-dist", "mixed"] as const, DEF.mode) };
  });

  const [mode, setMode] = useState(initial.mode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (mode !== DEF.mode) m.mode = mode;
    return m;
  }, [mode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onModeChange = useCallback((v: CoordGeometryMode) => {
    setMode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.mode) p.mode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateCoordGeometry(seed, mode), [seed, mode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={mode} onChange={(e) => onModeChange(e.target.value as CoordGeometryMode)}>
          <option value="mixed">すべて</option>
          <option value="distance">2点間の距離</option>
          <option value="division">内分点</option>
          <option value="line-eq">直線の方程式</option>
          <option value="point-line-dist">点と直線の距離</option>
        </select>
      </label>
    </div>
  );

  return (
    <ProblemPageLayout showAnswers={showAnswers} showSettings={showSettings} handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers} setShowSettings={setShowSettings} settingsPanel={settingsPanel} qrUrl={qrUrl}>
      {renderExprProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

export default CoordGeometry;
