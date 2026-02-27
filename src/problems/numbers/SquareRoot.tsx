import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { type SqrtMode, generateSqrt } from "./square-root";
import { parseEnum } from "../shared/enum-utils";

const DEF = { sqmode: "mixed" as SqrtMode };
const PARAM_KEYS = ["sqmode"];

const SquareRoot = () => {
  const [sqmode, setSqmode] = useState<SqrtMode>(() => {
    const p = new URLSearchParams(window.location.search);
    return parseEnum(p.get("sqmode"), ["find", "simplify", "mul-div", "add-sub", "rationalize", "mixed"] as const, DEF.sqmode);
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (sqmode !== DEF.sqmode) m.sqmode = sqmode;
    return m;
  }, [sqmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onSqmodeChange = useCallback((v: SqrtMode) => {
    setSqmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.sqmode) p.sqmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateSqrt(seed, sqmode), [seed, sqmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select
          className="operator-select"
          value={sqmode}
          onChange={(e) => onSqmodeChange(e.target.value as SqrtMode)}
        >
          <option value="mixed">すべて</option>
          <option value="find">平方根を求める</option>
          <option value="simplify">根号の簡約化</option>
          <option value="mul-div">乗除</option>
          <option value="add-sub">加減</option>
          <option value="rationalize">有理化</option>
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
                <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
              </span>
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default SquareRoot;
