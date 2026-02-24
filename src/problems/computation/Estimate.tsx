import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateEstimate } from "./estimate";

const DEF = { erto: 10 };
const PARAM_KEYS = ["erto"];

const Estimate = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const erto = Math.max(10, Math.min(100,
      parseInt(p.get("erto") ?? String(DEF.erto), 10) || DEF.erto));
    return { erto };
  });

  const [erto, setErto] = useState(initial.erto);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (erto !== DEF.erto) m.erto = String(erto);
    return m;
  }, [erto]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onErtoChange = useCallback((v: number) => {
    setErto(v);
    const p: Record<string, string> = {};
    if (v !== DEF.erto) p.erto = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateEstimate(seed, erto), [seed, erto]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        概数の位{" "}
        <select className="operator-select" value={erto}
          onChange={(e) => onErtoChange(Number(e.target.value))}>
          <option value={10}>十の位</option>
          <option value={100}>百の位</option>
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

export default Estimate;
