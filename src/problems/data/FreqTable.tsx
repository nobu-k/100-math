import { useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateFreqTable } from "./freq-table";

const PARAM_KEYS: string[] = [];

const FreqTable = () => {
  const getSettingsParams = useCallback((): Record<string, string> => ({}), []);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const problems = useMemo(() => generateFreqTable(seed), [seed]);

  return (
    <ProblemPageLayout
      showAnswers={showAnswers}
      showSettings={showSettings}
      handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers}
      setShowSettings={setShowSettings}
      settingsPanel={null}
      qrUrl={qrUrl}
    >
      <div className="dev-text-page">
        {problems.map((p, idx) => {
          let ansIdx = 0;
          return (
            <div key={idx} className="dev-prop-block">
              <div className="dev-prop-label">({idx + 1}) データ: {p.data.join(", ")}</div>
              <table className="dev-prop-table">
                <thead><tr><th>階級</th><th>度数</th></tr></thead>
                <tbody>
                  {p.classes.map((cls, j) => {
                    const freq = p.frequencies[j];
                    if (freq !== null) return (<tr key={j}><td>{cls}</td><td>{freq}</td></tr>);
                    const ans = p.answers[ansIdx++];
                    return (<tr key={j}><td>{cls}</td><td className="dev-prop-blank">
                      <span className={showAnswers ? "dev-frac-ans" : "ws-hidden"}>{ans}</span>
                    </td></tr>);
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

export default FreqTable;
