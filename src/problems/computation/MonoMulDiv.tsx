import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import { unicodeToLatex } from "../shared/katex-utils";
import { M, texRed } from "../shared/M";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import useProblemPage from "../shared/useProblemPage";
import type { MonoMulDivMode } from "./mono-mul-div";
import { generateMonoMulDiv } from "./mono-mul-div";

const DEF = { mmmode: "mixed" as MonoMulDivMode };
const PARAM_KEYS = ["mmmode"];

const MonoMulDiv = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const mmmode = parseEnum(p.get("mmmode"), ["mul", "div", "mixed"] as const, DEF.mmmode);
    return { mmmode };
  });

  const [mmmode, setMmmode] = useState(initial.mmmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (mmmode !== DEF.mmmode) m.mmmode = mmmode;
    return m;
  }, [mmmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onMmmodeChange = useCallback((v: MonoMulDivMode) => {
    setMmmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.mmmode) p.mmmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateMonoMulDiv(seed, mmmode), [seed, mmmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={mmmode}
          onChange={(e) => onMmmodeChange(e.target.value as MonoMulDivMode)}>
          <option value="mixed">すべて</option>
          <option value="mul">乗法のみ</option>
          <option value="div">除法のみ</option>
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
      <div className="g1-page g1-cols-2">
        {problems.map((p, i) => (
          <div key={i} className="g1-problem">
            <span className="g1-num">({i + 1})</span>
            <span className="g1-expr">
              <M tex={`${unicodeToLatex(p.expr)} =`} />
              <span className={showAnswers ? "" : "g1-hidden"}>
                <M tex={texRed(unicodeToLatex(p.answerExpr))} />
              </span>
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default MonoMulDiv;
