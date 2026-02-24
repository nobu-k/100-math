import { useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderFigProblems } from "./renderHelpers";
import { generateCircleRD } from "./circle-rd";
import CircleRDFig from "./figures/circle-rd-fig";

const PARAM_KEYS: string[] = [];

const CircleRD = () => {
  const getSettingsParams = useCallback((): Record<string, string> => ({}), []);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const problems = useMemo(() => generateCircleRD(seed), [seed]);

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
      {renderFigProblems(problems, CircleRDFig, showAnswers)}
    </ProblemPageLayout>
  );
};

export default CircleRD;
