import { useCallback, useMemo } from "react";
import { M, texAns } from "../shared/M";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateFracCompare } from "./frac-compare";

const PARAM_KEYS: string[] = [];

const FracCompare = () => {
  const getSettingsParams = useCallback((): Record<string, string> => ({}), []);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const problems = useMemo(() => generateFracCompare(seed), [seed]);

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
      <div className="ws-page ws-cols-2 print-spread">
        {problems.map((p, i) => (
          <div key={i} className="ws-problem">
            <span className="ws-num">({i + 1})</span>
            <M tex={`\\frac{${p.aNum}}{${p.aDen}} ${texAns(p.answer, showAnswers)} \\frac{${p.bNum}}{${p.bDen}}`} />
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default FracCompare;
