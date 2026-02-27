import { useState, useCallback, useMemo } from "react";
import { M, texAns } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generatePosNegAddSub } from "./pos-neg-add-sub";

const DEF = { terms: 2 as 2 | 3 };
const PARAM_KEYS = ["terms"];

const PosNegAddSub = () => {
  const [initial] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const termsRaw = p.get("terms");
    const terms: 2 | 3 = termsRaw === "3" ? 3 : DEF.terms;
    return { terms };
  });

  const [terms, setTerms] = useState(initial.terms);

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (terms !== DEF.terms) m.terms = String(terms);
    return m;
  }, [terms]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onTermsChange = useCallback((v: 2 | 3) => {
    setTerms(v);
    const p: Record<string, string> = {};
    if (v !== DEF.terms) p.terms = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generatePosNegAddSub(seed, terms), [seed, terms]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        項の数{" "}
        <select className="operator-select" value={terms}
          onChange={(e) => onTermsChange(Number(e.target.value) as 2 | 3)}>
          <option value={2}>2項</option>
          <option value={3}>3項</option>
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
      <div className="ws-page ws-cols-2 print-spread">
        {problems.map((p, i) => {
          const parts = p.terms.map((t, j) => {
            const sign = j === 0 ? "" : (t >= 0 ? "+" : "-");
            const val = j === 0
              ? `(${t >= 0 ? "+" : ""}${t})`
              : `(${t >= 0 ? "+" : ""}${Math.abs(t)})`;
            return `${sign} ${val}`;
          }).join(" ");
          return (
            <div key={i} className="ws-problem">
              <span className="ws-num">({i + 1})</span>
              <M tex={`${parts} = ${texAns(p.answer, showAnswers)}`} />
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default PosNegAddSub;
