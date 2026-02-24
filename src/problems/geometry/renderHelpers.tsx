import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";

export const renderFigProblems = <T extends { question: string; answer: string }>(
  items: T[],
  FigComponent: React.ComponentType<{ problem: T }>,
  showAnswers: boolean,
) => (
  <div className="dev-fig-page">
    {items.map((p, i) => (
      <div key={i} className="dev-prop-block">
        <div className="dev-prop-label">({i + 1})</div>
        <FigComponent problem={p} />
        <div style={{ marginTop: 8 }}>
          <div className="dev-text-row">
            <span className="dev-text-q">{p.question}</span>
            <span className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
              <M tex={texRed(unicodeToLatex(p.answer))} />
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const renderFigProblemsQA = <T extends { question: string; answerDisplay: string }>(
  items: T[],
  FigComponent: React.ComponentType<{ problem: T }>,
  showAnswers: boolean,
) => (
  <div className="dev-fig-page">
    {items.map((p, i) => (
      <div key={i} className="dev-prop-block">
        <div className="dev-prop-label">({i + 1})</div>
        <FigComponent problem={p} />
        <div className="dev-text-q">{p.question}</div>
        <div className={`dev-text-a${showAnswers ? "" : " g1-hidden"}`}>
          <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
        </div>
      </div>
    ))}
  </div>
);
