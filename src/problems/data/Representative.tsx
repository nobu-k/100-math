import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateRepresentative } from "./representative";
import { parseEnum } from "../shared/enum-utils";

type RepFind = "mixed" | "mean" | "median" | "mode";

const REPFIND_DEF: RepFind = "mixed";
const REPFIND_VALUES: readonly RepFind[] = ["mixed", "mean", "median", "mode"];
const PARAM_KEYS = ["repfind"];

const Representative = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      repfind: parseEnum(p.get("repfind"), REPFIND_VALUES, REPFIND_DEF),
    };
  });

  const [repfind, setRepfind] = useState(initial.repfind);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (repfind !== REPFIND_DEF) m.repfind = repfind;
    return m;
  }, [repfind]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onRepfindChange = useCallback((v: RepFind) => {
    setRepfind(v);
    const p: Record<string, string> = {};
    if (v !== REPFIND_DEF) p.repfind = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateRepresentative(seed, repfind), [seed, repfind]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        求めるもの{" "}
        <select className="operator-select" value={repfind}
          onChange={(e) => onRepfindChange(e.target.value as RepFind)}>
          <option value="mixed">すべて</option>
          <option value="mean">平均値</option>
          <option value="median">中央値</option>
          <option value="mode">最頻値</option>
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
      <div className="dev-text-page">
        {problems.map((p, i) => (
          <div key={i} className="dev-prop-block">
            <div className="dev-prop-label">({i + 1}) データ: {p.data.join(", ")}</div>
            {(repfind === "mean" || repfind === "mixed") && (
              <div className="dev-text-row">
                <span className="dev-text-q">平均値:</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.meanAnswer}</span>
              </div>
            )}
            {(repfind === "median" || repfind === "mixed") && (
              <div className="dev-text-row">
                <span className="dev-text-q">中央値:</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.medianAnswer}</span>
              </div>
            )}
            {(repfind === "mode" || repfind === "mixed") && (
              <div className="dev-text-row">
                <span className="dev-text-q">最頻値:</span>
                <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.modeAnswer}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default Representative;
