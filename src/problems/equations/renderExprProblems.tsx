import { M, texRed } from "../shared/M";
import { MixedMath } from "../shared/MixedMath";
import { unicodeToLatex } from "../shared/katex-utils";

/**
 * CJK detection — same range as MixedMath.
 */
const CJK_RE = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF01-\uFF60]/;

export const renderExprProblems = (items: { expr: string; answerExpr: string }[], showAnswers: boolean) => (
  <div className="ws-page ws-cols-2 ws-expr-page print-spread">
    {items.map((p, i) => (
      <div key={i} className="ws-problem ws-problem-expr">
        <span className="ws-num">({i + 1})</span>
        <div className="ws-expr-col">
          {CJK_RE.test(p.expr)
            ? <MixedMath text={p.expr} />
            : <M tex={`\\phantom{=\\,}${unicodeToLatex(p.expr)}`} />}
          <div className="ws-eq-answer">
            <M tex="=" />
            <span className={showAnswers ? "" : "ws-hidden"}>
              {CJK_RE.test(p.answerExpr)
                ? <MixedMath text={p.answerExpr} red />
                : <M tex={texRed(unicodeToLatex(p.answerExpr))} />}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);
