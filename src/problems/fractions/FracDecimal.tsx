import { useState, useCallback, useMemo } from "react";
import { parseEnum } from "../shared/enum-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateFracDecimal } from "./frac-decimal";

const DEF = { fdec: "mixed" as "mixed" | "to-decimal" | "to-fraction" };
const PARAM_KEYS = ["fdir"];

const FracDecimal = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const fdec = parseEnum(p.get("fdir"), ["mixed", "to-decimal", "to-fraction"] as const, DEF.fdec);
    return { fdec };
  });

  const [fdec, setFdec] = useState(initial.fdec);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (fdec !== DEF.fdec) m.fdir = fdec;
    return m;
  }, [fdec]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onFdecChange = useCallback((v: "mixed" | "to-decimal" | "to-fraction") => {
    setFdec(v);
    const p: Record<string, string> = {};
    if (v !== DEF.fdec) p.fdir = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateFracDecimal(seed, fdec), [seed, fdec]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        変換方向{" "}
        <select className="operator-select" value={fdec}
          onChange={(e) => onFdecChange(e.target.value as "mixed" | "to-decimal" | "to-fraction")}>
          <option value="mixed">両方</option>
          <option value="to-decimal">分数→小数</option>
          <option value="to-fraction">小数→分数</option>
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

export default FracDecimal;
