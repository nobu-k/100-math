import { useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateCrossTable } from "./cross-table";

const PARAM_KEYS: string[] = [];

const CrossTable = () => {
  const getSettingsParams = useCallback((): Record<string, string> => ({}), []);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const problems = useMemo(() => generateCrossTable(seed), [seed]);

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
              <div className="dev-prop-label">({idx + 1}) {p.title}</div>
              <table className="dev-prop-table">
                <thead><tr><th></th>{p.colLabels.map((col, j) => <th key={j}>{col}</th>)}</tr></thead>
                <tbody>
                  {p.rowLabels.map((row, r) => (
                    <tr key={r}>
                      <td><strong>{row}</strong></td>
                      {p.cells[r].map((cell, c) => {
                        if (cell !== null) return <td key={c}>{cell}</td>;
                        const ans = p.answers[ansIdx++];
                        return (<td key={c} className="dev-prop-blank">
                          <span className={showAnswers ? "dev-frac-ans" : "g1-hidden"}>{ans}</span>
                        </td>);
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default CrossTable;
