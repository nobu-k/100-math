import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateTimeCalc } from "./time-calc";
import { parseEnum } from "../shared/enum-utils";

type TimeType = "mixed" | "after" | "duration";

const TTYPE_DEF: TimeType = "mixed";
const TTYPE_VALUES: readonly TimeType[] = ["mixed", "after", "duration"];
const PARAM_KEYS = ["ttype"];

const TimeCalc = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { ttype: parseEnum(p.get("ttype"), TTYPE_VALUES, TTYPE_DEF) };
  });

  const [ttype, setTtype] = useState(initial.ttype);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (ttype !== TTYPE_DEF) m.ttype = ttype;
    return m;
  }, [ttype]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onTtypeChange = useCallback((v: TimeType) => {
    setTtype(v);
    const p: Record<string, string> = {};
    if (v !== TTYPE_DEF) p.ttype = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateTimeCalc(seed, ttype), [seed, ttype]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        問題の種類{" "}
        <select className="operator-select" value={ttype}
          onChange={(e) => onTtypeChange(e.target.value as TimeType)}>
          <option value="mixed">すべて</option>
          <option value="after">時刻を求める</option>
          <option value="duration">時間を求める</option>
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

export default TimeCalc;
