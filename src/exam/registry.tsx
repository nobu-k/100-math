import type { ReactNode } from "react";
import type { ExamOperatorDef } from "./types";
import { M, texAns, texRed, texFrac } from "../problems/shared/M";
import { MixedMath } from "../problems/shared/MixedMath";
import { unicodeToLatex } from "../problems/shared/katex-utils";
import type { TextProblem } from "../problems/shared/types";
import type { FracProblem } from "../problems/fractions/types";

// --- generators ---
import { generateDivision } from "../problems/computation/division";
import { generateMixedCalc } from "../problems/computation/mixed-calc";
import { generatePosNegAddSub } from "../problems/computation/pos-neg-add-sub";
import { generatePosNegMulDiv } from "../problems/computation/pos-neg-mul-div";
import { generatePosNegMixed } from "../problems/computation/pos-neg-mixed";
import { generatePolyAddSub } from "../problems/computation/poly-add-sub";
import { generateMonoMulDiv } from "../problems/computation/mono-mul-div";
import { generateFracMixedCalc } from "../problems/computation/frac-mixed-calc";
import { generateFracMul } from "../problems/fractions/frac-mul";
import { generateLinearEq } from "../problems/equations/linear-eq";
import { generateSimEq } from "../problems/equations/simultaneous-eq";
import { generateExpansion } from "../problems/equations/expansion";
import { generateFactoring } from "../problems/equations/factoring";
import { generateQuadEq } from "../problems/equations/quadratic-eq";
import { generateSqrt } from "../problems/numbers/square-root";
import { generateSpeed } from "../problems/measurement/speed";
import { generateIrrationalCalc } from "../problems/math1/irrational-calc";
import { generateLogCalc } from "../problems/math2/log-calc";
import { generateDerivativePoly } from "../problems/math2/derivative-poly";
import { generateIntegralPoly } from "../problems/math2/integral-poly";

// ============================================================
// Template helpers
// ============================================================

const CJK_RE = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF01-\uFF60]/;

type ExprItem = { expr: string; answerExpr: string; isNL?: boolean };

const renderExprGrid = (items: ExprItem[], showAnswers: boolean, cols: 2 | 3 = 2): ReactNode => (
  <div className={`exam-grid exam-cols-${cols}`}>
    {items.map((p, i) => {
      const isNL = p.isNL ?? false;
      return (
        <div key={i} className="exam-problem exam-problem-expr">
          <span className="exam-num">({i + 1})</span>
          {isNL ? (
            <div className="exam-expr-col exam-expr-nl">
              <MixedMath text={p.expr} />
              <div className="exam-nl-answer">
                <span className="exam-nl-label">答え：</span>
                {showAnswers
                  ? <span>{CJK_RE.test(p.answerExpr)
                      ? <MixedMath text={p.answerExpr} red />
                      : <M tex={texRed(unicodeToLatex(p.answerExpr))} />}</span>
                  : <span className="exam-nl-line" />}
              </div>
            </div>
          ) : (
            <div className="exam-expr-col">
              <M tex={`\\phantom{=\\,}${unicodeToLatex(p.expr)}`} />
              <div className="exam-eq-answer">
                <M tex="=" />
                <span className={showAnswers ? "" : "ws-hidden"}>
                  {CJK_RE.test(p.answerExpr)
                    ? <MixedMath text={p.answerExpr} red />
                    : <M tex={texRed(unicodeToLatex(p.answerExpr))} />}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

const renderKatexGrid = (
  items: unknown[],
  showAnswers: boolean,
  renderItem: (p: unknown, show: boolean) => string,
  cols: 2 | 3 = 2,
): ReactNode => (
  <div className={`exam-grid exam-cols-${cols}`}>
    {items.map((p, i) => (
      <div key={i} className="exam-problem">
        <span className="exam-num">({i + 1})</span>
        <M tex={renderItem(p, showAnswers)} />
      </div>
    ))}
  </div>
);

/** Template: problems with { expr, answerExpr, isNL? } */
const exprOperator = (
  opts: Omit<ExamOperatorDef, "generate" | "render"> & {
    gen: (seed: number, count: number) => ExprItem[];
    cols?: 2 | 3;
  },
): ExamOperatorDef => ({
  ...opts,
  generate: opts.gen,
  render: (problems, showAnswers) =>
    renderExprGrid(problems as ExprItem[], showAnswers, opts.cols ?? 2),
});

/** Template: problems rendered via custom KaTeX per item */
const katexOperator = (
  opts: Omit<ExamOperatorDef, "generate" | "render"> & {
    gen: (seed: number, count: number) => unknown[];
    renderItem: (p: unknown, show: boolean) => string;
    cols?: 2 | 3;
  },
): ExamOperatorDef => ({
  ...opts,
  generate: opts.gen,
  render: (problems, showAnswers) =>
    renderKatexGrid(problems, showAnswers, opts.renderItem, opts.cols ?? 2),
});

/** Template: TextProblem[] */
const textOperator = (
  opts: Omit<ExamOperatorDef, "generate" | "render"> & {
    gen: (seed: number, count: number) => TextProblem[];
  },
): ExamOperatorDef => ({
  ...opts,
  generate: opts.gen,
  render: (problems, showAnswers) => (
    <div className="exam-text-list">
      {(problems as TextProblem[]).map((p, i) => (
        <div key={i} className="exam-text-row">
          <span className="exam-num">({i + 1})</span>
          <span className="exam-text-q">{p.question}</span>
          <span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.answer}</span>
        </div>
      ))}
    </div>
  ),
});

/** Template: FracProblem[] with op symbol */
const fracOperator = (
  opts: Omit<ExamOperatorDef, "generate" | "render"> & {
    gen: (seed: number, count: number) => FracProblem[];
    opSymbol: string;
  },
): ExamOperatorDef => ({
  ...opts,
  generate: opts.gen,
  render: (problems, showAnswers) => (
    <div className="exam-grid exam-cols-2">
      {(problems as FracProblem[]).map((p, i) => (
        <div key={i} className="exam-problem">
          <span className="exam-num">({i + 1})</span>
          <M tex={`\\frac{${p.aNum}}{${p.aDen}} ${unicodeToLatex(opts.opSymbol)} \\frac{${p.bNum}}{${p.bDen}} = ${showAnswers ? texRed(texFrac(p.ansNum, p.ansDen, p.ansWhole, p.ansPartNum)) : texAns("?", false)}`} />
        </div>
      ))}
    </div>
  ),
});

/** Template: SimEqProblem[] */
const simEqOperator = (
  opts: Omit<ExamOperatorDef, "generate" | "render"> & {
    gen: (seed: number, count: number) => { eq1: string; eq2: string; answerX: number; answerY: number }[];
  },
): ExamOperatorDef => ({
  ...opts,
  generate: opts.gen,
  render: (problems, showAnswers) => (
    <div className="exam-grid exam-cols-2">
      {(problems as { eq1: string; eq2: string; answerX: number; answerY: number }[]).map((p, i) => (
        <div key={i} className="exam-sim-block">
          <div className="exam-num">({i + 1})</div>
          <M tex={`\\begin{cases} ${unicodeToLatex(p.eq1)} \\\\ ${unicodeToLatex(p.eq2)} \\end{cases}`} />
          <div className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>
            <M tex={texRed(`x = ${p.answerX},\\, y = ${p.answerY}`)} />
          </div>
        </div>
      ))}
    </div>
  ),
});

// ============================================================
// Operator definitions
// ============================================================

type DivP = { dividend: number; divisor: number; quotient: number; remainder: number };
type MixedCalcP = { display: string; answer: number };
type PosNegAddSubP = { terms: number[]; answer: number };
type PosNegMulDivP = { expr: string; answer: number };
type PosNegMixedP = { expr: string; answer: number };
type LinearEqP = { equation: string; answer: number; isFraction: boolean; fracNum?: number; fracDen?: number };
type QuadEqP = { equation: string; answerDisplay: string };
type SqrtP = { expr: string; answerDisplay: string };

const formatPosNegTerms = (terms: number[]): string =>
  terms.map((t, j) => {
    const sign = j === 0 ? "" : (t >= 0 ? "+" : "-");
    const val = j === 0
      ? `(${t >= 0 ? "+" : ""}${t})`
      : `(${t >= 0 ? "+" : ""}${Math.abs(t)})`;
    return `${sign} ${val}`;
  }).join(" ");

const definitions: ExamOperatorDef[] = [
  katexOperator({
    key: "computation/division",
    label: "わり算",
    groupLabel: "計算",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 15,
    cols: 3,
    gen: (seed, count) => generateDivision(seed, "mixed").slice(0, count),
    renderItem: (p, show) => {
      const d = p as DivP;
      const rem = d.remainder > 0 ? `\\text{ あまり }${texAns(d.remainder, show)}` : "";
      return `${d.dividend} \\div ${d.divisor} = ${texAns(d.quotient, show)}${rem}`;
    },
  }),
  katexOperator({
    key: "computation/mixed-calc",
    label: "四則混合",
    groupLabel: "計算",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateMixedCalc(seed, true).slice(0, count),
    renderItem: (p, show) => {
      const m = p as MixedCalcP;
      return `${unicodeToLatex(m.display)} = ${texAns(m.answer, show)}`;
    },
  }),
  katexOperator({
    key: "computation/pos-neg-add-sub",
    label: "正負の加減",
    groupLabel: "計算",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 15,
    gen: (seed, count) => generatePosNegAddSub(seed).slice(0, count),
    renderItem: (p, show) => {
      const pn = p as PosNegAddSubP;
      return `${formatPosNegTerms(pn.terms)} = ${texAns(pn.answer, show)}`;
    },
  }),
  exprOperator({
    key: "computation/pos-neg-mul-div",
    label: "正負の乗除",
    groupLabel: "計算",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 15,
    gen: (seed, count) =>
      generatePosNegMulDiv(seed).slice(0, count).map((p: PosNegMulDivP) => ({
        expr: p.expr,
        answerExpr: String(p.answer),
      })),
  }),
  exprOperator({
    key: "computation/pos-neg-mixed",
    label: "正負の混合",
    groupLabel: "計算",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 15,
    gen: (seed, count) =>
      generatePosNegMixed(seed).slice(0, count).map((p: PosNegMixedP) => ({
        expr: p.expr,
        answerExpr: String(p.answer),
      })),
  }),
  exprOperator({
    key: "computation/poly-add-sub",
    label: "多項式の加減",
    groupLabel: "計算",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generatePolyAddSub(seed).slice(0, count),
  }),
  exprOperator({
    key: "computation/mono-mul-div",
    label: "単項式の乗除",
    groupLabel: "計算",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateMonoMulDiv(seed).slice(0, count),
  }),
  fracOperator({
    key: "computation/frac-mixed-calc",
    label: "分数の四則混合",
    groupLabel: "計算",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 10,
    opSymbol: "",
    gen: (seed, count) => generateFracMixedCalc(seed).slice(0, count),
  }),
  fracOperator({
    key: "fractions/frac-mul",
    label: "分数のかけ算",
    groupLabel: "分数",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    opSymbol: "×",
    gen: (seed, count) => generateFracMul(seed).slice(0, count),
  }),
  katexOperator({
    key: "equations/linear-eq",
    label: "1次方程式",
    groupLabel: "方程式",
    instruction: "次の方程式を解きなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateLinearEq(seed).slice(0, count),
    renderItem: (p, show) => {
      const eq = p as LinearEqP;
      const ans = eq.isFraction && eq.fracNum !== undefined && eq.fracDen !== undefined
        ? `\\frac{${eq.fracNum}}{${eq.fracDen}}`
        : String(eq.answer);
      return `${unicodeToLatex(eq.equation)} \\quad x = ${texAns(ans, show)}`;
    },
  }),
  simEqOperator({
    key: "equations/simultaneous-eq",
    label: "連立方程式",
    groupLabel: "方程式",
    instruction: "次の連立方程式を解きなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateSimEq(seed).slice(0, count),
  }),
  exprOperator({
    key: "equations/expansion",
    label: "展開",
    groupLabel: "方程式",
    instruction: "次の式を展開しなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateExpansion(seed, "mixed", count),
  }),
  exprOperator({
    key: "equations/factoring",
    label: "因数分解",
    groupLabel: "方程式",
    instruction: "次の式を因数分解しなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateFactoring(seed, "mixed", count),
  }),
  katexOperator({
    key: "equations/quadratic-eq",
    label: "2次方程式",
    groupLabel: "方程式",
    instruction: "次の方程式を解きなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateQuadEq(seed, "mixed", count),
    renderItem: (p, show) => {
      const q = p as QuadEqP;
      const ans = show ? `\\quad ${texRed(unicodeToLatex(q.answerDisplay))}` : "";
      return `${unicodeToLatex(q.equation)}${ans}`;
    },
  }),
  katexOperator({
    key: "numbers/square-root",
    label: "平方根",
    groupLabel: "数の性質",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateSqrt(seed).slice(0, count),
    renderItem: (p, show) => {
      const sq = p as SqrtP;
      const ans = show ? `\\quad ${texRed(unicodeToLatex(sq.answerDisplay))}` : "";
      return `${unicodeToLatex(sq.expr)} =${ans}`;
    },
  }),
  textOperator({
    key: "measurement/speed",
    label: "速さ",
    groupLabel: "測定",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateSpeed(seed, "mixed").slice(0, count),
  }),
  exprOperator({
    key: "math1/irrational-calc",
    label: "無理数の計算",
    groupLabel: "数学I",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateIrrationalCalc(seed, "mixed", count),
  }),
  exprOperator({
    key: "math2/log-calc",
    label: "対数の計算",
    groupLabel: "数学II",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateLogCalc(seed, "mixed", count),
  }),
  exprOperator({
    key: "math2/derivative-poly",
    label: "微分",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateDerivativePoly(seed, "mixed", count),
  }),
  exprOperator({
    key: "math2/integral-poly",
    label: "積分",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateIntegralPoly(seed, "mixed", count),
  }),
];

// ============================================================
// Exports
// ============================================================

export const examOperatorMap = new Map<string, ExamOperatorDef>(
  definitions.map((d) => [d.key, d]),
);

export const examOperators = definitions;

export const examOperatorGroups = (): { label: string; operators: ExamOperatorDef[] }[] => {
  const map = new Map<string, ExamOperatorDef[]>();
  for (const d of definitions) {
    const list = map.get(d.groupLabel) ?? [];
    list.push(d);
    map.set(d.groupLabel, list);
  }
  return [...map.entries()].map(([label, operators]) => ({ label, operators }));
};
