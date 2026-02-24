import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateTimeCalc3 } from "./time-calc3";
import { parseEnum } from "../shared/enum-utils";

type Time3Mode = "mixed" | "after" | "duration" | "seconds";

const T3MODE_DEF: Time3Mode = "mixed";
const T3MODE_VALUES: readonly Time3Mode[] = ["mixed", "after", "duration", "seconds"];
const PARAM_KEYS = ["t3mode"];

const TimeCalc3 = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { t3mode: parseEnum(p.get("t3mode"), T3MODE_VALUES, T3MODE_DEF) };
  });

  const [t3mode, setT3mode] = useState(initial.t3mode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (t3mode !== T3MODE_DEF) m.t3mode = t3mode;
    return m;
  }, [t3mode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onT3modeChange = useCallback((v: Time3Mode) => {
    setT3mode(v);
    const p: Record<string, string> = {};
    if (v !== T3MODE_DEF) p.t3mode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateTimeCalc3(seed, t3mode), [seed, t3mode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        問題の種類{" "}
        <select className="operator-select" value={t3mode}
          onChange={(e) => onT3modeChange(e.target.value as Time3Mode)}>
          <option value="mixed">すべて</option>
          <option value="after">時刻を求める</option>
          <option value="duration">時間を求める</option>
          <option value="seconds">秒の計算</option>
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

export default TimeCalc3;
