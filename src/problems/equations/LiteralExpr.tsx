import { useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateLiteralExpr } from "./literal-expr";

const PARAM_KEYS: string[] = [];

const LiteralExpr = () => {
  const getSettingsParams = useCallback((): Record<string, string> => ({}), []);

  const {
    seed, showAnswers, showSettings, setShowSettings,
    handleNew, handleToggleAnswers, qrUrl,
  } = useProblemPage(PARAM_KEYS, getSettingsParams);

  const problems = useMemo(() => generateLiteralExpr(seed), [seed]);

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
        {problems.map((p, i) => (
          <div key={i} className="dev-text-row">
            <span className="g1-num">({i + 1})</span>
            <span className="dev-text-q">{p.question}</span>
            <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>{p.answer}</span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default LiteralExpr;
