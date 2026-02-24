import { useState, useCallback, useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { type PrimeMode, generatePrime } from "./prime";

const DEF = { prmode: "identify" as PrimeMode };
const PARAM_KEYS = ["prmode"];
const PR_VALID = ["identify", "factorize"] as const;

const Prime = () => {
  const [prmode, setPrmode] = useState<PrimeMode>(() => {
    const p = new URLSearchParams(window.location.search);
    const raw = p.get("prmode") ?? DEF.prmode;
    return PR_VALID.includes(raw as PrimeMode) ? (raw as PrimeMode) : DEF.prmode;
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (prmode !== DEF.prmode) m.prmode = prmode;
    return m;
  }, [prmode]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onPrmodeChange = useCallback((v: PrimeMode) => {
    setPrmode(v);
    const p: Record<string, string> = {};
    if (v !== DEF.prmode) p.prmode = v;
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generatePrime(seed, prmode), [seed, prmode]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        種類{" "}
        <select
          className="operator-select"
          value={prmode}
          onChange={(e) => onPrmodeChange(e.target.value as PrimeMode)}
        >
          <option value="identify">素数の判定</option>
          <option value="factorize">素因数分解</option>
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
        {problems.map((p, i) => {
          if (p.mode === "identify") {
            return (
              <div key={i} className="dev-prop-block">
                <div className="dev-prop-label">
                  ({i + 1}) 次の数のうち素数をすべて選びなさい
                </div>
                <div className="dev-text-q" style={{ fontSize: "1.1em" }}>
                  {p.numbers!.join(", ")}
                </div>
                <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                  {p.primes!.join(", ")}
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="dev-text-row">
              <span className="g1-num">({i + 1})</span>
              <span className="dev-text-q">{p.target} を素因数分解しなさい</span>
              <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
                <M tex={texRed(unicodeToLatex(p.factorExpr!))} />
              </span>
            </div>
          );
        })}
      </div>
    </ProblemPageLayout>
  );
};

export default Prime;
