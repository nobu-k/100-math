import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblemsQA } from "./renderHelpers";
import { generateParallelogram } from "./parallelogram";
import type { ParallelogramMode } from "./parallelogram";
import ParallelogramFig from "./figures/parallelogram-fig";

const DEF = { pgmode: "mixed" as ParallelogramMode };
const PARAM_KEYS = ["pgmode"];

const Parallelogram = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const pgmodeRaw = p.get("pgmode") ?? DEF.pgmode;
    const pgmode = (["sides", "angles", "diagonals", "mixed"] as const).includes(pgmodeRaw as any)
      ? (pgmodeRaw as ParallelogramMode) : DEF.pgmode;
    return { pgmode };
  });

  const [pgmode, setPgmode] = useState(initial.pgmode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (pgmode !== DEF.pgmode) m.pgmode = pgmode;
    return m;
  }, [pgmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPgmodeChange = useCallback((v: ParallelogramMode) => {
    setPgmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.pgmode) p.pgmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateParallelogram(seed, pgmode), [seed, pgmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"種類 "}
        <select className="operator-select" value={pgmode}
          onChange={(e) => onPgmodeChange(e.target.value as ParallelogramMode)}>
          <option value="mixed">すべて</option>
          <option value="sides">辺</option>
          <option value="angles">角度</option>
          <option value="diagonals">対角線</option>
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
      {renderFigProblemsQA(problems, ParallelogramFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default Parallelogram;
