import { useCallback, useMemo } from "react";
import { M, texAns } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generateAngle } from "./angle";
import type { AngleProblem } from "./angle";
import AngleFig from "./figures/angle-fig";

const PARAM_KEYS: string[] = [];

const Angle = () => {
  const getSettingsParams = useCallback((): Record<string, string> => ({}), []);

  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, qrUrl } =
    useProblemPage(PARAM_KEYS, getSettingsParams);

  const problems = useMemo(() => generateAngle(seed), [seed]);

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
      <div className="dev-fig-page">
        {problems.map((p: AngleProblem, i: number) => (
          <div key={i} className="dev-prop-block">
            <div className="dev-prop-label">({i + 1})</div>
            <AngleFig problem={p} />
            <div style={{ marginTop: 8 }}>
              <div className="dev-text-row">
                <M tex={`${unicodeToLatex(p.display)} = ${texAns(p.answer + "^{\\circ}", showAnswers)}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default Angle;
