import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderArrowTextProblems } from "../shared/renderHelpers";
import { generateLargeNum } from "./large-num";

const DEF = { range: 1000 };
const PARAM_KEYS = ["range"];

const LargeNum = () => {
  const [range, setRange] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const v = parseInt(p.get("range") ?? String(DEF.range), 10) || DEF.range;
    return Math.max(100, Math.min(10000, v));
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (range !== DEF.range) m.range = String(range);
    return m;
  }, [range]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onRangeChange = useCallback((v: number) => {
    setRange(v);
    const p: Record<string, string> = {};
    if (v !== DEF.range) p.range = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateLargeNum(seed, range), [seed, range]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        数の範囲{" "}
        <select
          className="operator-select"
          value={range}
          onChange={(e) => onRangeChange(Number(e.target.value))}
        >
          <option value={100}>~100</option>
          <option value={1000}>~1000</option>
          <option value={10000}>~10000</option>
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
      {renderArrowTextProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

export default LargeNum;
