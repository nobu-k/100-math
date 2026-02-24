import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblems } from "./renderHelpers";
import { generateCircumference } from "./circumference";
import CircumferenceFig from "./figures/circumference-fig";

const DEF = { cmode: "mixed" as const };
const PARAM_KEYS = ["cmode"];

const Circumference = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const cmode = parseEnum(p.get("cmode"), ["forward", "reverse", "mixed"] as const, DEF.cmode);
    return { cmode };
  });

  const [cmode, setCmode] = useState(initial.cmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (cmode !== DEF.cmode) m.cmode = cmode;
    return m;
  }, [cmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onCmodeChange = useCallback((v: typeof cmode) => {
    setCmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.cmode) p.cmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateCircumference(seed, cmode), [seed, cmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"問題の種類 "}
        <select className="operator-select" value={cmode}
          onChange={(e) => onCmodeChange(e.target.value as any)}>
          <option value="mixed">すべて</option>
          <option value="forward">円周を求める</option>
          <option value="reverse">直径を求める</option>
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
      {renderFigProblems(problems, CircumferenceFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default Circumference;
