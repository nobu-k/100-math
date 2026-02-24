import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblemsQA } from "./renderHelpers";
import { generateParallelAngle } from "./parallel-angle";
import type { ParallelAngleMode } from "./parallel-angle";
import ParallelAngleFig from "./figures/parallel-angle-fig";

const DEF = { plmode: "mixed" as ParallelAngleMode };
const PARAM_KEYS = ["plmode"];

const ParallelAngle = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const plmodeRaw = p.get("plmode") ?? DEF.plmode;
    const plmode = (["vertical", "corresponding", "alternate", "mixed"] as const).includes(plmodeRaw as any)
      ? (plmodeRaw as ParallelAngleMode) : DEF.plmode;
    return { plmode };
  });

  const [plmode, setPlmode] = useState(initial.plmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (plmode !== DEF.plmode) m.plmode = plmode;
    return m;
  }, [plmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPlmodeChange = useCallback((v: ParallelAngleMode) => {
    setPlmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.plmode) p.plmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateParallelAngle(seed, plmode), [seed, plmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"種類 "}
        <select className="operator-select" value={plmode}
          onChange={(e) => onPlmodeChange(e.target.value as ParallelAngleMode)}>
          <option value="mixed">すべて</option>
          <option value="vertical">対頂角</option>
          <option value="corresponding">同位角</option>
          <option value="alternate">錯角</option>
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
      {renderFigProblemsQA(problems, ParallelAngleFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default ParallelAngle;
