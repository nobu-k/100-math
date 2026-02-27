import { useMemo } from "react";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateArithmeticSeq } from "./arithmetic-seq";
import { renderExprProblems } from "../equations/renderExprProblems";

const PARAM_KEYS: string[] = [];

const ArithmeticSeq = () => {
  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, qrUrl } =
    useProblemPage(PARAM_KEYS, () => ({}));

  const problems = useMemo(() => generateArithmeticSeq(seed), [seed]);

  return (
    <ProblemPageLayout showAnswers={showAnswers} showSettings={showSettings} handleNew={handleNew}
      handleToggleAnswers={handleToggleAnswers} setShowSettings={setShowSettings} settingsPanel={null} qrUrl={qrUrl}>
      {renderExprProblems(problems, showAnswers)}
    </ProblemPageLayout>
  );
};

export default ArithmeticSeq;
