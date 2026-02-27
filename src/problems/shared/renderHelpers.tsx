import { M, texAns, texFrac, texRed } from "./M";
import { unicodeToLatex } from "./katex-utils";
import type { TextProblem } from "./types";
import type { FracProblem } from "../fractions/types";

export const renderTextProblems = (items: TextProblem[], showAnswers: boolean) => (
  <div className="dev-text-page print-spread">
    {items.map((p, i) => (
      <div key={i} className="dev-text-row">
        <span className="ws-num">({i + 1})</span>
        <span className="dev-text-q">{p.question}</span>
        <span className={`dev-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.answer}</span>
      </div>
    ))}
  </div>
);

export const renderArrowTextProblems = (items: TextProblem[], showAnswers: boolean) => (
  <div className="dev-text-page print-spread">
    {items.map((p, i) => (
      <div key={i} className="dev-text-row">
        <span className="ws-num">({i + 1})</span>
        <span className="dev-text-q">{p.question}</span>
        <span className="dev-text-arrow">&rarr;</span>
        <span className={`dev-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.answer}</span>
      </div>
    ))}
  </div>
);

export const renderFracProblems = (
  problems: FracProblem[],
  opSymbol: string,
  showAnswers: boolean,
) => (
  <div className="ws-page ws-cols-2 print-spread">
    {problems.map((p, i) => (
      <div key={i} className="ws-problem">
        <span className="ws-num">({i + 1})</span>
        <M tex={`\\frac{${p.aNum}}{${p.aDen}} ${unicodeToLatex(opSymbol)} \\frac{${p.bNum}}{${p.bDen}} = ${showAnswers ? texRed(texFrac(p.ansNum, p.ansDen, p.ansWhole, p.ansPartNum)) : texAns("?", false)}`} />
      </div>
    ))}
  </div>
);
