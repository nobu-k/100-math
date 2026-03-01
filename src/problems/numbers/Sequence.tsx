import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateSequence } from "./sequence";
import "./sequence.css";

const DEF = { step: 0, smax: 20 };
const PARAM_KEYS = ["step", "smax"];

const Sequence = () => {
  const [step, setStep] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const raw = p.get("step");
    if (raw === null) return DEF.step;
    const v = parseInt(raw, 10);
    return Number.isNaN(v) ? DEF.step : Math.max(0, Math.min(10, v));
  });
  const [smax, setSmax] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const v = parseInt(p.get("smax") ?? String(DEF.smax), 10) || DEF.smax;
    return Math.max(10, Math.min(100, v));
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (step !== DEF.step) m.step = String(step);
    if (smax !== DEF.smax) m.smax = String(smax);
    return m;
  }, [step, smax]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onStepChange = useCallback((v: number) => {
    setStep(v);
    const p: Record<string, string> = {};
    if (v !== DEF.step) p.step = String(v);
    if (smax !== DEF.smax) p.smax = String(smax);
    regen(p);
  }, [smax, regen]);

  const onSmaxChange = useCallback((v: number) => {
    setSmax(v);
    const p: Record<string, string> = {};
    if (step !== DEF.step) p.step = String(step);
    if (v !== DEF.smax) p.smax = String(v);
    regen(p);
  }, [step, regen]);

  const problems = useMemo(() => generateSequence(seed, step, smax), [seed, step, smax]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        いくつとび{" "}
        <select
          className="operator-select"
          value={step}
          onChange={(e) => onStepChange(Number(e.target.value))}
        >
          <option value={0}>ランダム</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </label>
      <label>
        最大の数{" "}
        <select
          className="operator-select"
          value={smax}
          onChange={(e) => onSmaxChange(Number(e.target.value))}
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
      <div className="ws-seq-page print-spread ws-large">
        {problems.map((p, i) => (
          <div key={i} className="ws-seq-row">
            <span className="ws-num">({i + 1})</span>
            <span className="ws-seq-cells">
              {p.cells.map((c, j) => {
                const blankIdx =
                  c === null
                    ? p.cells.slice(0, j).filter((x) => x === null).length
                    : -1;
                return (
                  <span key={j} className="ws-seq-cell-wrap">
                    {j > 0 && <span className="ws-seq-arrow">&rarr;</span>}
                    {c !== null ? (
                      <span className="ws-seq-cell">{c}</span>
                    ) : (
                      <span className="ws-seq-cell ws-seq-cell-blank">
                        {showAnswers && (
                          <span className="ws-seq-cell-answer">{p.answers[blankIdx]}</span>
                        )}
                      </span>
                    )}
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default Sequence;
