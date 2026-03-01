import { useState, useCallback, useMemo } from "react";
import { M, texBox } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateDecomposition } from "./decomposition";

const DEF = { target: 10 };
const PARAM_KEYS = ["target"];

const Decomposition = () => {
  const [target, setTarget] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const v = parseInt(p.get("target") ?? String(DEF.target), 10) || DEF.target;
    return Math.max(2, Math.min(20, v));
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (target !== DEF.target) m.target = String(target);
    return m;
  }, [target]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onTargetChange = useCallback((v: number) => {
    setTarget(v);
    const p: Record<string, string> = {};
    if (v !== DEF.target) p.target = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateDecomposition(seed, target), [seed, target]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        いくつにする{" "}
        <select
          className="operator-select"
          value={target}
          onChange={(e) => onTargetChange(Number(e.target.value))}
        >
          {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(
            (n) => <option key={n} value={n}>{n}</option>,
          )}
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
      <div className="ws-page ws-cols-2 print-spread ws-large">
        {problems.map((p, i) => {
          const tex = p.position === "left"
            ? `${p.target} = ${p.given} + ${texBox(p.answer, showAnswers)}`
            : `${p.target} = ${texBox(p.answer, showAnswers)} + ${p.given}`;
          return (
            <div key={i} className="ws-problem">
              <span className="ws-num">({i + 1})</span>
              <M tex={tex} />
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default Decomposition;
