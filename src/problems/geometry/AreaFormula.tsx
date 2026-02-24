import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblems } from "./renderHelpers";
import { generateAreaFormula } from "./area-formula";
import AreaFormulaFig from "./figures/area-formula-fig";

const DEF = { ashape: "mixed" as const };
const PARAM_KEYS = ["ashape"];

const AreaFormula = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const ashape = parseEnum(p.get("ashape"), ["triangle", "parallelogram", "trapezoid", "mixed"] as const, DEF.ashape);
    return { ashape };
  });

  const [ashape, setAshape] = useState(initial.ashape);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (ashape !== DEF.ashape) m.ashape = ashape;
    return m;
  }, [ashape]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onAshapeChange = useCallback((v: typeof ashape) => {
    setAshape(v);
    const p: Record<string, string> = {};
    if (v !== DEF.ashape) p.ashape = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateAreaFormula(seed, ashape), [seed, ashape]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"図形 "}
        <select className="operator-select" value={ashape}
          onChange={(e) => onAshapeChange(e.target.value as any)}>
          <option value="mixed">すべて</option>
          <option value="triangle">三角形</option>
          <option value="parallelogram">平行四辺形</option>
          <option value="trapezoid">台形</option>
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
      {renderFigProblems(problems, AreaFormulaFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default AreaFormula;
