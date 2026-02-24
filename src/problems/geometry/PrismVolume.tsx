import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblems } from "./renderHelpers";
import { generatePrismVolume } from "./prism-volume";
import PrismVolumeFig from "./figures/prism-volume-fig";

const DEF = { pvshape: "mixed" as const };
const PARAM_KEYS = ["pvshape"];

const PrismVolume = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const pvshapeRaw = p.get("pvshape") ?? DEF.pvshape;
    const pvshape: "prism" | "cylinder" | "mixed" =
      (["prism", "cylinder", "mixed"] as const).includes(pvshapeRaw as any)
        ? (pvshapeRaw as any) : DEF.pvshape;
    return { pvshape };
  });

  const [pvshape, setPvshape] = useState(initial.pvshape);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (pvshape !== DEF.pvshape) m.pvshape = pvshape;
    return m;
  }, [pvshape]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPvshapeChange = useCallback((v: typeof pvshape) => {
    setPvshape(v);
    const p: Record<string, string> = {};
    if (v !== DEF.pvshape) p.pvshape = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generatePrismVolume(seed, pvshape), [seed, pvshape]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"形 "}
        <select className="operator-select" value={pvshape}
          onChange={(e) => onPvshapeChange(e.target.value as any)}>
          <option value="mixed">すべて</option>
          <option value="prism">角柱</option>
          <option value="cylinder">円柱</option>
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
      {renderFigProblems(problems, PrismVolumeFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default PrismVolume;
