import { useState, useCallback, useMemo } from "react";
import { M, texAns } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateMixedCalc } from "./mixed-calc";

const PARAM_KEYS = ["paren"];

const MixedCalc = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const paren = p.get("paren") !== "0";
    return { paren };
  });

  const [paren, setParen] = useState(initial.paren);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (!paren) m.paren = "0";
    return m;
  }, [paren]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onParenChange = useCallback((v: boolean) => {
    setParen(v);
    const p: Record<string, string> = {};
    if (!v) p.paren = "0";
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateMixedCalc(seed, paren), [seed, paren]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        ( ) を含む{" "}
        <select className="operator-select" value={paren ? "1" : "0"}
          onChange={(e) => onParenChange(e.target.value === "1")}>
          <option value="1">あり</option>
          <option value="0">なし</option>
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
      <div className="ws-page ws-cols-2">
        {problems.map((p, i) => (
          <div key={i} className="ws-problem">
            <span className="ws-num">({i + 1})</span>
            <M tex={`${unicodeToLatex(p.display)} = ${texAns(p.answer, showAnswers)}`} />
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default MixedCalc;
