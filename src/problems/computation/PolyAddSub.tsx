import { useMemo } from "react";
import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";
import useProblemPage from "../shared/useProblemPage";
import ProblemPageLayout from "../shared/ProblemPageLayout";
import { generatePolyAddSub } from "./poly-add-sub";

const PARAM_KEYS: string[] = [];

const PolyAddSub = () => {
  const { seed, showAnswers, showSettings, setShowSettings, handleNew, handleToggleAnswers, qrUrl } =
    useProblemPage(PARAM_KEYS, () => ({}));

  const problems = useMemo(() => generatePolyAddSub(seed), [seed]);

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
      <div className="g1-page g1-cols-2">
        {problems.map((p, i) => (
          <div key={i} className="g1-problem">
            <span className="g1-num">({i + 1})</span>
            <span className="g1-expr">
              <M tex={`${unicodeToLatex(p.expr)} =`} />
              <span className={showAnswers ? "" : "g1-hidden"}>
                <M tex={texRed(unicodeToLatex(p.answerExpr))} />
              </span>
            </span>
          </div>
        ))}
      </div>
    </ProblemPageLayout>
  );
};

export default PolyAddSub;
