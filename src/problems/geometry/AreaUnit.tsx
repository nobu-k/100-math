import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateAreaUnit } from "./area-unit";

const DEF = { aunit: "mixed" as const };
const PARAM_KEYS = ["aunit"];

const AreaUnit = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const aunit = parseEnum(p.get("aunit"), ["cm-m", "m-ha", "mixed"] as const, DEF.aunit);
    return { aunit };
  });

  const [aunit, setAunit] = useState(initial.aunit);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (aunit !== DEF.aunit) m.aunit = aunit;
    return m;
  }, [aunit]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onAunitChange = useCallback((v: typeof aunit) => {
    setAunit(v);
    const p: Record<string, string> = {};
    if (v !== DEF.aunit) p.aunit = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateAreaUnit(seed, aunit), [seed, aunit]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        {"単位 "}
        <select className="operator-select" value={aunit}
          onChange={(e) => onAunitChange(e.target.value as any)}>
          <option value="mixed">すべて</option>
          <option value="cm-m">cm²・m²</option>
          <option value="m-ha">m²・ha・km²</option>
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

export default AreaUnit;
