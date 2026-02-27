import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type LinearInequalityMode, generateLinearInequality } from "./linear-inequality";

const DEF = { mode: "mixed" as LinearInequalityMode };
const PARAM_KEYS = ["mode"];

const LinearInequality = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { mode: parseEnum(p.get("mode"), ["single", "system", "mixed"] as const, DEF.mode) };
  });

  const [mode, setMode] = useState(initial.mode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (mode !== DEF.mode) m.mode = mode;
    return m;
  }, [mode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onModeChange = useCallback((v: LinearInequalityMode) => {
    setMode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.mode) p.mode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateLinearInequality(seed, mode), [seed, mode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={mode} onChange={(e) => onModeChange(e.target.value as LinearInequalityMode)}>
          <option value="mixed">すべて</option>
          <option value="single">一次不等式</option>
          <option value="system">連立不等式</option>
        </select>
      </label>
    </div>
  );

  return (
    <ProblemPageLayout showAnswers={showAnswers} showSettings={showSettings} handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers} setShowSettings={setShowSettings} settingsPanel={settingsPanel} qrUrl={qrUrl}>
      <div className="ws-page ws-cols-2 ws-expr-page print-spread">
        {problems.map((p, i) => (
          <div key={i} className="ws-problem ws-problem-expr">
            <span className="ws-num">({i + 1})</span>
            <div className="ws-expr-col">
              <M tex={unicodeToLatex(p.expr)} />
              <div className={`ws-eq-answer${showAnswers ? "" : " ws-hidden"}`}>
                <M tex={texRed(unicodeToLatex(p.answerExpr))} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default LinearInequality;
