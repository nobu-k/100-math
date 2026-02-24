import { useCallback, useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { renderTextProblems } from "../shared/renderHelpers";
import { generateDecimalShift } from "./decimal-shift";

const PARAM_KEYS: string[] = [];

const DecimalShift = () => {
  const getSettingsParams = useCallback((): Record<string, string> => ({}), []);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const problems = useMemo(() => generateDecimalShift(seed), [seed]);

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
      {renderTextProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

export default DecimalShift;
