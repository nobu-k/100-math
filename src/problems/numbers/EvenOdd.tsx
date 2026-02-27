import { useState, useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateEvenOdd } from "./even-odd";

const DEF = { eorange: 100 };
const PARAM_KEYS = ["eorange"];

const EvenOdd = () => {
  const [eorange, setEorange] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const v = parseInt(p.get("eorange") ?? String(DEF.eorange), 10) || DEF.eorange;
    return Math.max(100, Math.min(10000, v));
  });

  const getSettingsParams = useCallback((): Record<string, string> => {
    const m: Record<string, string> = {};
    if (eorange !== DEF.eorange) m.eorange = String(eorange);
    return m;
  }, [eorange]);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, regen, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const onEorangeChange = useCallback((v: number) => {
    setEorange(v);
    const p: Record<string, string> = {};
    if (v !== DEF.eorange) p.eorange = String(v);
    regen(p);
  }, [regen]);

  const problems = useMemo(() => generateEvenOdd(seed, eorange), [seed, eorange]);

  const settingsPanel = (
    <div className="no-print settings-panel">
      <label>
        数の範囲{" "}
        <select
          className="operator-select"
          value={eorange}
          onChange={(e) => onEorangeChange(Number(e.target.value))}
        >
          <option value={100}>1~100</option>
          <option value={1000}>1~1000</option>
          <option value={10000}>1~10000</option>
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
          <div key={i} className="dev-text-row">
            <span className="ws-num">({i + 1})</span>
            <span className="dev-text-q">{p.numbers.join("\u3001")}</span>
            <span className={`dev-text-a${showAnswers ? "" : " ws-hidden"}`}>
              偶数: {p.evenAnswers.join("\u3001")} ／ 奇数: {p.oddAnswers.join("\u3001")}
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default EvenOdd;
