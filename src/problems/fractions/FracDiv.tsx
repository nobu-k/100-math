import { useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFracProblems } from "../shared/renderHelpers";
import { generateFracDiv } from "./frac-div";

const PARAM_KEYS: string[] = [];

const FracDiv = () => {
  const getSettingsParams = useCallback((): Record<string, string> => ({}), []);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const problems = useMemo(() => generateFracDiv(seed), [seed]);

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
      {renderFracProblems(problems, "\u00f7", showAnswers)}
    </ProblemPageLayout>
  );
};

export default FracDiv;
