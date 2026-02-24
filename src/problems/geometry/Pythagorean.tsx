import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblemsQA } from "./renderHelpers";
import { generatePythagorean } from "./pythagorean";
import type { PythagoreanMode } from "./pythagorean";
import PythagoreanFig from "./figures/pythagorean-fig";

const DEF = { ptmode: "mixed" as PythagoreanMode };
const PARAM_KEYS = ["ptmode"];

const Pythagorean = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const ptmodeRaw = p.get("ptmode") ?? DEF.ptmode;
    const ptmode = (["basic", "special", "applied", "mixed"] as const).includes(ptmodeRaw as any)
      ? (ptmodeRaw as PythagoreanMode) : DEF.ptmode;
    return { ptmode };
  });

  const [ptmode, setPtmode] = useState(initial.ptmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (ptmode !== DEF.ptmode) m.ptmode = ptmode;
    return m;
  }, [ptmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPtmodeChange = useCallback((v: PythagoreanMode) => {
    setPtmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.ptmode) p.ptmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generatePythagorean(seed, ptmode), [seed, ptmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"種類 "}
        <select className="operator-select" value={ptmode}
          onChange={(e) => onPtmodeChange(e.target.value as PythagoreanMode)}>
          <option value="mixed">すべて</option>
          <option value="basic">基本</option>
          <option value="special">特殊な直角三角形</option>
          <option value="applied">応用</option>
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
      {renderFigProblemsQA(problems, PythagoreanFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default Pythagorean;
