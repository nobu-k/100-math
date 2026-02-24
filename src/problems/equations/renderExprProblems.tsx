import { M, texRed } from "../shared/M";
import { unicodeToLatex } from "../shared/katex-utils";

export const renderExprProblems = (items: { expr: string; answerExpr: string }[], showAnswers: boolean) => (
  <div className="g1-page g1-cols-2 g1-expr-page">
    {items.map((p, i) => (
      <div key={i} className="g1-problem g1-problem-expr">
        <span className="g1-num">({i + 1})</span>
        <div className="g1-expr-col">
          <M tex={`\\phantom{=\\,}${unicodeToLatex(p.expr)}`} />
          <div className="g1-eq-answer">
            <M tex="=" />
            <span className={showAnswers ? "" : "g1-hidden"}>
              <M tex={texRed(unicodeToLatex(p.answerExpr))} />
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);
