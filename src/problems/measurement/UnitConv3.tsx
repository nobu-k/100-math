import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateUnitConv3 } from "./unit-conv3";
import { parseEnum } from "../shared/enum-utils";

type Unit3Type = "mixed" | "length" | "weight";

const UNIT3_DEF: Unit3Type = "mixed";
const UNIT3_VALUES: readonly Unit3Type[] = ["mixed", "length", "weight"];
const PARAM_KEYS = ["unit3"];

const UnitConv3 = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { unit3: parseEnum(p.get("unit3"), UNIT3_VALUES, UNIT3_DEF) };
  });

  const [unit3, setUnit3] = useState(initial.unit3);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (unit3 !== UNIT3_DEF) m.unit3 = unit3;
    return m;
  }, [unit3]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onUnit3Change = useCallback((v: Unit3Type) => {
    setUnit3(v);
    const p: Record<string, string> = {};
    if (v !== UNIT3_DEF) p.unit3 = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateUnitConv3(seed, unit3), [seed, unit3]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        単位{" "}
        <select className="operator-select" value={unit3}
          onChange={(e) => onUnit3Change(e.target.value as Unit3Type)}>
          <option value="mixed">すべて</option>
          <option value="length">長さ（m・km）</option>
          <option value="weight">重さ（g・kg・t）</option>
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

export default UnitConv3;
