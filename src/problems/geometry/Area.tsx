import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblems } from "./renderHelpers";
import { generateArea } from "./area";
import AreaFig from "./figures/area-fig";

const DEF = { shape: "mixed" as const };
const PARAM_KEYS = ["shape"];

const Area = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const shapeRaw = p.get("shape") ?? DEF.shape;
    const shape: "square" | "rect" | "mixed" =
      (["square", "rect", "mixed"] as const).includes(shapeRaw as any)
        ? (shapeRaw as any) : DEF.shape;
    return { shape };
  });

  const [shape, setShape] = useState(initial.shape);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (shape !== DEF.shape) m.shape = shape;
    return m;
  }, [shape]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onShapeChange = useCallback((v: typeof shape) => {
    setShape(v);
    const p: Record<string, string> = {};
    if (v !== DEF.shape) p.shape = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateArea(seed, shape), [seed, shape]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"図形 "}
        <select className="operator-select" value={shape}
          onChange={(e) => onShapeChange(e.target.value as any)}>
          <option value="mixed">正方形・長方形</option>
          <option value="square">正方形のみ</option>
          <option value="rect">長方形のみ</option>
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
      {renderFigProblems(problems, AreaFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default Area;
