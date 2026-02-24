import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateDecimalPlace } from "./decimal-place";
import { parseEnum } from "../shared/enum-utils";

type DpMode = "count" | "multiply" | "mixed";

const DEF = { dpmode: "mixed" as DpMode };
const PARAM_KEYS = ["dpmode"];

const DecimalPlace = () => {
  const [dpmode, setDpmode] = useState<DpMode>(() => {
    const p = new URLSearchParams(window.location.search);
    return parseEnum(p.get("dpmode"), ["count", "multiply", "mixed"] as const, DEF.dpmode);
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (dpmode !== DEF.dpmode) m.dpmode = dpmode;
    return m;
  }, [dpmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onDpmodeChange = useCallback((v: DpMode) => {
    setDpmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.dpmode) p.dpmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateDecimalPlace(seed, dpmode), [seed, dpmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select
          className="operator-select"
          value={dpmode}
          onChange={(e) => onDpmodeChange(e.target.value as DpMode)}
        >
          <option value="mixed">すべて</option>
          <option value="count">0.1が何個</option>
          <option value="multiply">10倍・1/10</option>
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

export default DecimalPlace;
