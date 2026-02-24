import { useState, useCallback, useMemo } from "react";
import { M, texAns } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import type { PosNegMulDivMode } from "./pos-neg-mul-div";
import { generatePosNegMulDiv } from "./pos-neg-mul-div";

const DEF = { mdmode: "mixed" as PosNegMulDivMode };
const PARAM_KEYS = ["mdmode"];

const PosNegMulDiv = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const mdmodeRaw = p.get("mdmode") ?? DEF.mdmode;
    const mdmode = (["mul", "div", "mixed", "power"] as const).includes(mdmodeRaw as any)
      ? (mdmodeRaw as PosNegMulDivMode) : DEF.mdmode;
    return { mdmode };
  });

  const [mdmode, setMdmode] = useState(initial.mdmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (mdmode !== DEF.mdmode) m.mdmode = mdmode;
    return m;
  }, [mdmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onMdmodeChange = useCallback((v: PosNegMulDivMode) => {
    setMdmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.mdmode) p.mdmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generatePosNegMulDiv(seed, mdmode), [seed, mdmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={mdmode}
          onChange={(e) => onMdmodeChange(e.target.value as PosNegMulDivMode)}>
          <option value="mixed">すべて</option>
          <option value="mul">乗法のみ</option>
          <option value="div">除法のみ</option>
          <option value="power">累乗のみ</option>
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
            <M tex={`${unicodeToLatex(p.expr)} = ${texAns(p.answer, showAnswers)}`} />
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default PosNegMulDiv;
