import { useState, useCallback, useMemo } from "react";
import { M } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type ExprValueVars, generateExprValue } from "./expr-value";

const DEF = { evvars: "one" as ExprValueVars };
const PARAM_KEYS = ["evvars"];

const ExprValue = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const evvars = parseEnum(p.get("evvars"), ["one", "two"] as const, DEF.evvars);
    return { evvars };
  });

  const [evvars, setEvvars] = useState(initial.evvars);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (evvars !== DEF.evvars) m.evvars = evvars;
    return m;
  }, [evvars]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onEvvarsChange = useCallback(
    (v: ExprValueVars) => {
      setEvvars(v);
      const p: Record<string, string> = {};
      if (v !== DEF.evvars) p.evvars = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateExprValue(seed, evvars), [seed, evvars]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        変数の数{" "}
        <select className="operator-select" value={evvars}
          onChange={(e) => onEvvarsChange(e.target.value as ExprValueVars)}>
          <option value="one">1つ</option>
          <option value="two">2つ</option>
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
      <div className="dev-text-page">
        {problems.map((p, i) => (
          <div key={i} className="dev-text-row">
            <span className="ws-num">({i + 1})</span>
            <span className="dev-text-q">
              <M tex={unicodeToLatex(p.varDisplay)} /> のとき <M tex={unicodeToLatex(p.expr)} /> の値は？
            </span>
            <span className={`dev-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.answer}</span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default ExprValue;
