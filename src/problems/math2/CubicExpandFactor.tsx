import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type CubicMode, generateCubicExpandFactor } from "./cubic-expand-factor";
import { renderExprProblems } from "../equations/renderExprProblems";

const DEF = { mode: "mixed" as CubicMode };
const PARAM_KEYS = ["mode"];

const CubicExpandFactor = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { mode: parseEnum(p.get("mode"), ["expand", "factor", "binomial-theorem", "mixed"] as const, DEF.mode) };
  });

  const [mode, setMode] = useState(initial.mode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (mode !== DEF.mode) m.mode = mode;
    return m;
  }, [mode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onModeChange = useCallback((v: CubicMode) => {
    setMode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.mode) p.mode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateCubicExpandFactor(seed, mode), [seed, mode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={mode} onChange={(e) => onModeChange(e.target.value as CubicMode)}>
          <option value="mixed">すべて</option>
          <option value="expand">展開</option>
          <option value="factor">因数分解</option>
          <option value="binomial-theorem">二項定理</option>
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

export default CubicExpandFactor;
