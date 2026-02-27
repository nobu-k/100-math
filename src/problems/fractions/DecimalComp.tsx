import { useState, useCallback, useMemo } from "react";
import { M, texBox } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateDecimalComp } from "./decimal-comp";

const DEF = { dmax: 10 };
const PARAM_KEYS = ["dmax"];

const DecimalComp = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const dmax = Math.max(5, Math.min(100,
      parseInt(p.get("dmax") ?? String(DEF.dmax), 10) || DEF.dmax));
    return { dmax };
  });

  const [dmax, setDmax] = useState(initial.dmax);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (dmax !== DEF.dmax) m.dmax = String(dmax);
    return m;
  }, [dmax]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onDmaxChange = useCallback((v: number) => {
    setDmax(v);
    const p: Record<string, string> = {};
    if (v !== DEF.dmax) p.dmax = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateDecimalComp(seed, dmax), [seed, dmax]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        最大の数{" "}
        <select className="operator-select" value={dmax}
          onChange={(e) => onDmaxChange(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
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
      <div className="ws-page ws-cols-3">
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

export default DecimalComp;
