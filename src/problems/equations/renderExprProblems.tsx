import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";

export const renderExprProblems = (items: { expr: string; answerExpr: string }[], showAnswers: boolean) => (
  <div className="ws-page ws-cols-2 ws-expr-page">
    {items.map((p, i) => (
      <div key={i} className="ws-problem ws-problem-expr">
        <span className="ws-num">({i + 1})</span>
        <div className="ws-expr-col">
          <M tex={`\\phantom{=\\,}${unicodeToLatex(p.expr)}`} />
          <div className="ws-eq-answer">
            <M tex="=" />
            <span className={showAnswers ? "" : "ws-hidden"}>
              <M tex={texRed(unicodeToLatex(p.answerExpr))} />
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);
