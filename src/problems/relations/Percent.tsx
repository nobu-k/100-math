import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generatePercent } from "./percent";

const DEF = { pfind: "mixed" as const };
const PARAM_KEYS = ["pfind"];

const Percent = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const pfindRaw = p.get("pfind") ?? DEF.pfind;
    const pfind: "mixed" | "ratio" | "compared" | "base" =
      (["mixed", "ratio", "compared", "base"] as const).includes(pfindRaw as any)
        ? (pfindRaw as any)
        : DEF.pfind;
    return { pfind };
  });

  const [pfind, setPfind] = useState(initial.pfind);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (pfind !== DEF.pfind) m.pfind = pfind;
    return m;
  }, [pfind]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPfindChange = useCallback(
    (v: "mixed" | "ratio" | "compared" | "base") => {
      setPfind(v);
      const p: Record<string, string> = {};
      if (v !== DEF.pfind) p.pfind = v;
      regen(p);
    },
    [regen],
  );

  const problems = useMemo(() => generatePercent(seed, pfind), [seed, pfind]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        求めるもの{" "}
        <select className="operator-select" value={pfind}
          onChange={(e) => onPfindChange(e.target.value as any)}>
          <option value="mixed">すべて</option>
          <option value="ratio">割合（何%？）</option>
          <option value="compared">比べる量</option>
          <option value="base">もとにする量</option>
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

export default Percent;
