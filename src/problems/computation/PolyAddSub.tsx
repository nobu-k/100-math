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
      <div className="ws-page ws-cols-2 print-spread">
        {problems.map((p, i) => (
          <div key={i} className="ws-problem">
            <span className="ws-num">({i + 1})</span>
            <span className="ws-expr">
              <M tex={`${unicodeToLatex(p.expr)} =`} />
              <span className={showAnswers ? "" : "ws-hidden"}>
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
