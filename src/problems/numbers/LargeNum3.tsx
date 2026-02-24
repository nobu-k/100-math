import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderArrowTextProblems } from "../shared/renderHelpers";
import { generateLargeNum3 } from "./large-num3";
import { parseEnum } from "../shared/enum-utils";

type Ln3Mode = "read" | "count" | "multiply" | "mixed";

const DEF = { ln3mode: "mixed" as Ln3Mode };
const PARAM_KEYS = ["ln3mode"];

const LargeNum3 = () => {
  const [ln3mode, setLn3mode] = useState<Ln3Mode>(() => {
    const p = new URLSearchParams(window.location.search);
    return parseEnum(p.get("ln3mode"), ["read", "count", "multiply", "mixed"] as const, DEF.ln3mode);
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (ln3mode !== DEF.ln3mode) m.ln3mode = ln3mode;
    return m;
  }, [ln3mode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onLn3modeChange = useCallback((v: Ln3Mode) => {
    setLn3mode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.ln3mode) p.ln3mode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateLargeNum3(seed, ln3mode), [seed, ln3mode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        問題の種類{" "}
        <select
          className="operator-select"
          value={ln3mode}
          onChange={(e) => onLn3modeChange(e.target.value as Ln3Mode)}
        >
          <option value="mixed">すべて</option>
          <option value="read">読み書き</option>
          <option value="count">いくつ分</option>
          <option value="multiply">何倍・1/N</option>
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
      {renderArrowTextProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

export default LargeNum3;
