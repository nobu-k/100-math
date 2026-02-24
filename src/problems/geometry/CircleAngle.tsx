import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblemsQA } from "./renderHelpers";
import { generateCircleAngle } from "./circle-angle";
import type { CircleAngleMode } from "./circle-angle";
import CircleAngleFig from "./figures/circle-angle-fig";

const DEF = { camode: "mixed" as CircleAngleMode };
const PARAM_KEYS = ["camode"];

const CircleAngle = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const camode = parseEnum(p.get("camode"), ["basic", "inscribed", "mixed"] as const, DEF.camode);
    return { camode };
  });

  const [camode, setCamode] = useState(initial.camode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (camode !== DEF.camode) m.camode = camode;
    return m;
  }, [camode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onCamodeChange = useCallback((v: CircleAngleMode) => {
    setCamode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.camode) p.camode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateCircleAngle(seed, camode), [seed, camode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"種類 "}
        <select className="operator-select" value={camode}
          onChange={(e) => onCamodeChange(e.target.value as CircleAngleMode)}>
          <option value="mixed">すべて</option>
          <option value="basic">基本</option>
          <option value="inscribed">内接図形</option>
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
      {renderFigProblemsQA(problems, CircleAngleFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default CircleAngle;
