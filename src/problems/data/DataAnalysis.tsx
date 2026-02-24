import { useState, useCallback, useMemo } from "react";
import type { DataAnalysisProblem, DataAnalysisMode } from "./data-analysis";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateDataAnalysis } from "./data-analysis";
import { parseEnum } from "../shared/enum-utils";

const DAMODE_DEF: DataAnalysisMode = "mixed";
const DAMODE_VALUES: readonly DataAnalysisMode[] = ["mixed", "representative", "frequency"];
const PARAM_KEYS = ["damode"];

const DataAnalysis = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      damode: parseEnum(p.get("damode"), DAMODE_VALUES, DAMODE_DEF),
    };
  });

  const [damode, setDamode] = useState(initial.damode);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (damode !== DAMODE_DEF) m.damode = damode;
    return m;
  }, [damode]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onDamodeChange = useCallback((v: DataAnalysisMode) => {
    setDamode(v);
    const p: Record<string, string> = {};
    if (v !== DAMODE_DEF) p.damode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateDataAnalysis(seed, damode), [seed, damode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select className="operator-select" value={damode}
          onChange={(e) => onDamodeChange(e.target.value as DataAnalysisMode)}>
          <option value="mixed">すべて</option>
          <option value="representative">代表値</option>
          <option value="frequency">度数分布表</option>
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
        {problems.map((p: DataAnalysisProblem, i: number) => {
          if (p.mode === "representative") {
            return (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">({i + 1}) データ: {p.data.join(", ")}</div>
                <div className="dev-text-row"><span className="dev-text-q">平均値:</span><span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.mean}</span></div>
                <div className="dev-text-row"><span className="dev-text-q">中央値:</span><span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.median}</span></div>
                <div className="dev-text-row"><span className="dev-text-q">最頻値:</span><span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.modeValue}</span></div>
                <div className="dev-text-row"><span className="dev-text-q">範囲:</span><span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.range}</span></div>
              </div>
            );
          }
          // frequency table
          return (
            <div key={i} className="dev-prop-block">
              <div className="dev-prop-label">({i + 1}) 度数分布表を完成させなさい（合計 {p.total} 人）</div>
              <table className="dev-prop-table">
                <thead><tr><th>階級</th><th>度数</th><th>相対度数</th><th>累積度数</th></tr></thead>
                <tbody>
                  {p.classes.map((cls, j) => {
                    const hidden = p.hiddenIndices.includes(j);
                    return (
                      <tr key={j}>
                        <td>{cls[0]}以上{cls[1]}未満</td>
                        <td className={hidden ? "dev-prop-blank" : ""}>
                          {hidden ? (<span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>{p.frequencies[j]}</span>) : p.frequencies[j]}
                        </td>
                        <td>{p.relativeFrequencies[j].toFixed(2)}</td>
                        <td>{p.cumulativeFrequencies[j]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default DataAnalysis;
