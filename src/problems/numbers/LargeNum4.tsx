import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateLargeNum4 } from "./large-num4";
import { parseEnum } from "../shared/enum-utils";

type Ln4Mode = "read" | "position" | "mixed";

const DEF = { ln4mode: "mixed" as Ln4Mode };
const PARAM_KEYS = ["ln4mode"];

const LargeNum4 = () => {
  const [ln4mode, setLn4mode] = useState<Ln4Mode>(() => {
    const p = new URLSearchParams(window.location.search);
    return parseEnum(p.get("ln4mode"), ["read", "position", "mixed"] as const, DEF.ln4mode);
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (ln4mode !== DEF.ln4mode) m.ln4mode = ln4mode;
    return m;
  }, [ln4mode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onLn4modeChange = useCallback((v: Ln4Mode) => {
    setLn4mode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.ln4mode) p.ln4mode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateLargeNum4(seed, ln4mode), [seed, ln4mode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select
          className="operator-select"
          value={ln4mode}
          onChange={(e) => onLn4modeChange(e.target.value as Ln4Mode)}
        >
          <option value="mixed">すべて</option>
          <option value="read">読み書き</option>
          <option value="position">位取り</option>
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
      {renderTextProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

export default LargeNum4;
