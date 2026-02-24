import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblemsQA } from "./renderHelpers";
import { generatePolygonAngle } from "./polygon-angle";
import type { PolygonAngleMode } from "./polygon-angle";
import PolygonAngleFig from "./figures/polygon-angle-fig";

const DEF = { pamode: "mixed" as PolygonAngleMode };
const PARAM_KEYS = ["pamode"];

const PolygonAngle = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const pamode = parseEnum(p.get("pamode"), ["interior-sum", "regular", "exterior", "find-n", "mixed"] as const, DEF.pamode);
    return { pamode };
  });

  const [pamode, setPamode] = useState(initial.pamode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (pamode !== DEF.pamode) m.pamode = pamode;
    return m;
  }, [pamode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPamodeChange = useCallback((v: PolygonAngleMode) => {
    setPamode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.pamode) p.pamode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generatePolygonAngle(seed, pamode), [seed, pamode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"種類 "}
        <select className="operator-select" value={pamode}
          onChange={(e) => onPamodeChange(e.target.value as PolygonAngleMode)}>
          <option value="mixed">すべて</option>
          <option value="interior-sum">内角の和</option>
          <option value="regular">正多角形の内角</option>
          <option value="exterior">外角の和</option>
          <option value="find-n">何角形？</option>
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
      {renderFigProblemsQA(problems, PolygonAngleFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default PolygonAngle;
