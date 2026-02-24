import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateUnitConv } from "./unit-conv";
import { parseEnum } from "../shared/enum-utils";

type UnitType = "mixed" | "length" | "volume";

const UNIT_DEF: UnitType = "mixed";
const UNIT_VALUES: readonly UnitType[] = ["mixed", "length", "volume"];
const PARAM_KEYS = ["unit"];

const UnitConv = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return { unit: parseEnum(p.get("unit"), UNIT_VALUES, UNIT_DEF) };
  });

  const [unit, setUnit] = useState(initial.unit);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (unit !== UNIT_DEF) m.unit = unit;
    return m;
  }, [unit]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onUnitChange = useCallback((v: UnitType) => {
    setUnit(v);
    const p: Record<string, string> = {};
    if (v !== UNIT_DEF) p.unit = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateUnitConv(seed, unit), [seed, unit]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        単位{" "}
        <select className="operator-select" value={unit}
          onChange={(e) => onUnitChange(e.target.value as UnitType)}>
          <option value="mixed">すべて</option>
          <option value="length">長さ（mm・cm・m）</option>
          <option value="volume">かさ（mL・dL・L）</option>
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

export default UnitConv;
