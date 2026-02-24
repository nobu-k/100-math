import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblems } from "./renderHelpers";
import { generateCircleArea } from "./circle-area";
import CircleAreaFig from "./figures/circle-area-fig";

const DEF = { ctype: "mixed" as const };
const PARAM_KEYS = ["ctype"];

const CircleArea = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const ctypeRaw = p.get("ctype") ?? DEF.ctype;
    const ctype: "basic" | "half" | "mixed" =
      (["basic", "half", "mixed"] as const).includes(ctypeRaw as any)
        ? (ctypeRaw as any) : DEF.ctype;
    return { ctype };
  });

  const [ctype, setCtype] = useState(initial.ctype);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (ctype !== DEF.ctype) m.ctype = ctype;
    return m;
  }, [ctype]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onCtypeChange = useCallback((v: typeof ctype) => {
    setCtype(v);
    const p: Record<string, string> = {};
    if (v !== DEF.ctype) p.ctype = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateCircleArea(seed, ctype), [seed, ctype]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"問題の種類 "}
        <select className="operator-select" value={ctype}
          onChange={(e) => onCtypeChange(e.target.value as any)}>
          <option value="mixed">すべて</option>
          <option value="basic">円</option>
          <option value="half">半円</option>
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
      {renderFigProblems(problems, CircleAreaFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default CircleArea;
