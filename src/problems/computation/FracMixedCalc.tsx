import { useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFracProblems } from "../shared/renderHelpers";
import { generateFracMixedCalc } from "./frac-mixed-calc";

const PARAM_KEYS: string[] = [];

const FracMixedCalc = () => {
  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, qrUrl } =
    useProblemPage(PARAM_KEYS, () => ({}));

  const problems = useMemo(() => generateFracMixedCalc(seed), [seed]);

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
      {renderFracProblems(problems, "\u00d7", showAnswers)}
    </ProblemPageLayout>
  );
};

export default FracMixedCalc;
