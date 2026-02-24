import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateRounding } from "./rounding";

const DEF = { rd: 3 };
const PARAM_KEYS = ["rd"];

const Rounding = () => {
  const [rd, setRd] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const v = parseInt(p.get("rd") ?? String(DEF.rd), 10) || DEF.rd;
    return Math.max(1, Math.min(4, v));
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (rd !== DEF.rd) m.rd = String(rd);
    return m;
  }, [rd]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onRdChange = useCallback((v: number) => {
    setRd(v);
    const p: Record<string, string> = {};
    if (v !== DEF.rd) p.rd = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateRounding(seed, rd), [seed, rd]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        数の桁数{" "}
        <select
          className="operator-select"
          value={rd}
          onChange={(e) => onRdChange(Number(e.target.value))}
        >
          <option value={2}>3~4桁</option>
          <option value={3}>3~5桁</option>
          <option value={4}>3~6桁</option>
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

export default Rounding;
