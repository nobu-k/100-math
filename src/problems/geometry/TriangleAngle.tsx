import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblemsQA } from "./renderHelpers";
import { generateTriAngle } from "./triangle-angle";
import type { TriAngleMode } from "./triangle-angle";
import TriangleAngleFig from "./figures/triangle-angle-fig";

const DEF = { tamode: "mixed" as TriAngleMode };
const PARAM_KEYS = ["tamode"];

const TriangleAngle = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const tamodeRaw = p.get("tamode") ?? DEF.tamode;
    const tamode = (["interior", "exterior", "mixed"] as const).includes(tamodeRaw as any)
      ? (tamodeRaw as TriAngleMode) : DEF.tamode;
    return { tamode };
  });

  const [tamode, setTamode] = useState(initial.tamode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (tamode !== DEF.tamode) m.tamode = tamode;
    return m;
  }, [tamode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onTamodeChange = useCallback((v: TriAngleMode) => {
    setTamode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.tamode) p.tamode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateTriAngle(seed, tamode), [seed, tamode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"種類 "}
        <select className="operator-select" value={tamode}
          onChange={(e) => onTamodeChange(e.target.value as TriAngleMode)}>
          <option value="mixed">すべて</option>
          <option value="interior">内角</option>
          <option value="exterior">外角</option>
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
      {renderFigProblemsQA(problems, TriangleAngleFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default TriangleAngle;
