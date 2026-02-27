import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateTableRead } from "./table-read";

const CATS_DEF = 4;
const PARAM_KEYS = ["cats"];

const TableRead = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      cats: Math.max(3, Math.min(5,
        parseInt(p.get("cats") ?? String(CATS_DEF), 10) || CATS_DEF)),
    };
  });

  const [cats, setCats] = useState(initial.cats);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (cats !== CATS_DEF) m.cats = String(cats);
    return m;
  }, [cats]);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, regen, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const onCatsChange = useCallback((v: number) => {
    setCats(v);
    const p: Record<string, string> = {};
    if (v !== CATS_DEF) p.cats = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateTableRead(seed, cats), [seed, cats]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        カテゴリ数{" "}
        <select className="operator-select" value={cats}
          onChange={(e) => onCatsChange(Number(e.target.value))}>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
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
        {problems.map((tp, idx) => (
          <div key={idx} className="dev-prop-block">
            <div className="dev-prop-label">({idx + 1}) {tp.title}</div>
            <table className="dev-prop-table">
              <thead><tr>{tp.categories.map((c, j) => <th key={j}>{c}</th>)}</tr></thead>
              <tbody><tr>{tp.values.map((v, j) => <td key={j}>{v}</td>)}</tr></tbody>
            </table>
            <div style={{ marginTop: 8 }}>
              {tp.questions.map((q, j) => (
                <div key={j} className="dev-text-row">
                  <span className="dev-text-q">{q.question}</span>
                  <span className={`dev-text-a${showAnswers ? "" : " ws-hidden"}`}>{q.answer}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default TableRead;
