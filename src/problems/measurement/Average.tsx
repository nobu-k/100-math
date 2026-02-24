import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateAverage } from "./average";

const ACNT_DEF = 5;
const PARAM_KEYS = ["acnt"];

const Average = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      acnt: Math.max(3, Math.min(6,
        parseInt(p.get("acnt") ?? String(ACNT_DEF), 10) || ACNT_DEF)),
    };
  });

  const [acnt, setAcnt] = useState(initial.acnt);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (acnt !== ACNT_DEF) m.acnt = String(acnt);
    return m;
  }, [acnt]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onAcntChange = useCallback((v: number) => {
    setAcnt(v);
    const p: Record<string, string> = {};
    if (v !== ACNT_DEF) p.acnt = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateAverage(seed, acnt), [seed, acnt]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        データの個数{" "}
        <select className="operator-select" value={acnt}
          onChange={(e) => onAcntChange(Number(e.target.value))}>
          <option value={3}>3個</option>
          <option value={4}>4個</option>
          <option value={5}>5個</option>
          <option value={6}>6個</option>
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
      {renderTextProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

export default Average;
