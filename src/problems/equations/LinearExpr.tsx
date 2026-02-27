import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type LinearExprMode, generateLinearExpr } from "./linear-expr";

const DEF = { lemode: "mixed" as LinearExprMode };
const PARAM_KEYS = ["lemode"];

const LinearExpr = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const lemode = parseEnum(p.get("lemode"), ["add-sub", "mul-div", "mixed"] as const, DEF.lemode);
    return { lemode };
  });

  const [lemode, setLemode] = useState(initial.lemode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (lemode !== DEF.lemode) m.lemode = lemode;
    return m;
  }, [lemode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onLemodeChange = useCallback(
    (v: LinearExprMode) => {
      setLemode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.lemode) p.lemode = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateLinearExpr(seed, lemode), [seed, lemode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={lemode}
          onChange={(e) => onLemodeChange(e.target.value as LinearExprMode)}>
          <option value="mixed">すべて</option>
          <option value="add-sub">加減のみ</option>
          <option value="mul-div">乗除のみ</option>
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
      <div className="ws-page ws-cols-2 print-spread">
        {problems.map((p, i) => (
          <div key={i} className="ws-problem">
            <span className="ws-num">({i + 1})</span>
            <span className="ws-expr">
              <M tex={`${unicodeToLatex(p.expr)} =`} />
              <span className={showAnswers ? "" : "ws-hidden"}>
                <M tex={texRed(unicodeToLatex(p.answerExpr))} />
              </span>
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default LinearExpr;
