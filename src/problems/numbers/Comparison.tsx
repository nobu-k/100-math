import { useState, useCallback, useMemo } from "react";
import { M, texBox } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateComparison } from "./comparison";

const DEF = { max: 20 };
const PARAM_KEYS = ["max"];

const Comparison = () => {
  const [max, setMax] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const v = parseInt(p.get("max") ?? String(DEF.max), 10) || DEF.max;
    return Math.max(5, Math.min(100, v));
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (max !== DEF.max) m.max = String(max);
    return m;
  }, [max]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onMaxChange = useCallback((v: number) => {
    setMax(v);
    const p: Record<string, string> = {};
    if (v !== DEF.max) p.max = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateComparison(seed, max), [seed, max]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        最大の数{" "}
        <select
          className="operator-select"
          value={max}
          onChange={(e) => onMaxChange(Number(e.target.value))}
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
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
      <div className="ws-page ws-cols-3 print-spread">
        {problems.map((p, i) => (
          <div key={i} className="ws-problem">
            <span className="ws-num">({i + 1})</span>
            <M tex={`${p.left} ${texBox(p.answer, showAnswers)} ${p.right}`} />
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default Comparison;
