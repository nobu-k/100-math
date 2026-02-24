import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblemsQA } from "./renderHelpers";
import { generateSimilarity } from "./similarity";
import type { SimilarityMode } from "./similarity";
import SimilarityFig from "./figures/similarity-fig";

const DEF = { smmode: "mixed" as SimilarityMode };
const PARAM_KEYS = ["smmode"];

const Similarity = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const smmodeRaw = p.get("smmode") ?? DEF.smmode;
    const smmode = (["ratio", "parallel-line", "midpoint", "mixed"] as const).includes(smmodeRaw as any)
      ? (smmodeRaw as SimilarityMode) : DEF.smmode;
    return { smmode };
  });

  const [smmode, setSmmode] = useState(initial.smmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (smmode !== DEF.smmode) m.smmode = smmode;
    return m;
  }, [smmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onSmmodeChange = useCallback((v: SimilarityMode) => {
    setSmmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.smmode) p.smmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateSimilarity(seed, smmode), [seed, smmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"種類 "}
        <select className="operator-select" value={smmode}
          onChange={(e) => onSmmodeChange(e.target.value as SimilarityMode)}>
          <option value="mixed">すべて</option>
          <option value="ratio">相似比</option>
          <option value="parallel-line">平行線と比</option>
          <option value="midpoint">中点連結定理</option>
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
      {renderFigProblemsQA(problems, SimilarityFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default Similarity;
