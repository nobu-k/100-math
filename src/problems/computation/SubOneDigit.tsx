import { useState, useCallback, useMemo } from "react";
import { M, texBox } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateSubOneDigit } from "./sub-one-digit";

const DEF = { max: 9 };
const COUNT = 20;
const PARAM_KEYS = ["max"];

const SubOneDigit = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const max = p.get("max") === "5" ? 5 : DEF.max;
    return { max };
  });

  const [max, setMax] = useState(initial.max);

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

  const problems = useMemo(() => generateSubOneDigit(seed, max, COUNT), [seed, max]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        大きさ{" "}
        <select className="operator-select" value={max}
          onChange={(e) => onMaxChange(Number(e.target.value))}>
          <option value={9}>9まで</option>
          <option value={5}>5まで</option>
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
        {problems.map((p, i) => (
          <div key={i} className="ws-problem">
            <span className="ws-num">({i + 1})</span>
            <M tex={`${p.a} - ${p.b} = ${texBox(p.answer, showAnswers)}`} />
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default SubOneDigit;
