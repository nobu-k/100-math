import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblems } from "./renderHelpers";
import { generateVolume } from "./volume";
import VolumeFig from "./figures/volume-fig";

const DEF = { vshape: "mixed" as const };
const PARAM_KEYS = ["vshape"];

const Volume = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const vshapeRaw = p.get("vshape") ?? DEF.vshape;
    const vshape: "cube" | "rect" | "mixed" =
      (["cube", "rect", "mixed"] as const).includes(vshapeRaw as any)
        ? (vshapeRaw as any) : DEF.vshape;
    return { vshape };
  });

  const [vshape, setVshape] = useState(initial.vshape);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (vshape !== DEF.vshape) m.vshape = vshape;
    return m;
  }, [vshape]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onVshapeChange = useCallback((v: typeof vshape) => {
    setVshape(v);
    const p: Record<string, string> = {};
    if (v !== DEF.vshape) p.vshape = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateVolume(seed, vshape), [seed, vshape]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"形 "}
        <select className="operator-select" value={vshape}
          onChange={(e) => onVshapeChange(e.target.value as any)}>
          <option value="mixed">立方体・直方体</option>
          <option value="cube">立方体のみ</option>
          <option value="rect">直方体のみ</option>
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
      {renderFigProblems(problems, VolumeFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default Volume;
