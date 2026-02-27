import { useState, useCallback, useMemo } from "react";
import { M, texAns } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { parseEnum } from "../shared/enum-utils";
import { type LinearEqMode, generateLinearEq } from "./linear-eq";

const DEF = { eqmode: "mixed" as LinearEqMode };
const PARAM_KEYS = ["eqmode"];

const LinearEq = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const eqmode = parseEnum(p.get("eqmode"), ["basic", "advanced", "mixed"] as const, DEF.eqmode);
    return { eqmode };
  });

  const [eqmode, setEqmode] = useState(initial.eqmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (eqmode !== DEF.eqmode) m.eqmode = eqmode;
    return m;
  }, [eqmode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onEqmodeChange = useCallback(
    (v: LinearEqMode) => {
      setEqmode(v);
      const p: Record<string, string> = {};
      if (v !== DEF.eqmode) p.eqmode = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateLinearEq(seed, eqmode), [seed, eqmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={eqmode}
          onChange={(e) => onEqmodeChange(e.target.value as LinearEqMode)}>
          <option value="mixed">すべて</option>
          <option value="basic">基本</option>
          <option value="advanced">移項・括弧</option>
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
            <M tex={`${unicodeToLatex(p.equation)} \\quad x = ${texAns(p.answer, showAnswers)}`} />
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default LinearEq;
