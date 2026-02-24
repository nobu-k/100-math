import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateProportion } from "./proportion-table";
import renderTableProblems from "./renderHelpers";

const DEF = { ptype: "mixed" as const };
const PARAM_KEYS = ["ptype"];

const ProportionTable = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const ptypeRaw = p.get("ptype") ?? DEF.ptype;
    const ptype: "mixed" | "direct" | "inverse" =
      (["mixed", "direct", "inverse"] as const).includes(ptypeRaw as any)
        ? (ptypeRaw as any)
        : DEF.ptype;
    return { ptype };
  });

  const [ptype, setPtype] = useState(initial.ptype);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (ptype !== DEF.ptype) m.ptype = ptype;
    return m;
  }, [ptype]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPtypeChange = useCallback(
    (v: "mixed" | "direct" | "inverse") => {
      setPtype(v);
      const p: Record<string, string> = {};
      if (v !== DEF.ptype) p.ptype = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generateProportion(seed, ptype), [seed, ptype]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={ptype}
          onChange={(e) => onPtypeChange(e.target.value as any)}>
          <option value="mixed">比例・反比例</option>
          <option value="direct">比例のみ</option>
          <option value="inverse">反比例のみ</option>
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
      {renderTableProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

export default ProportionTable;
