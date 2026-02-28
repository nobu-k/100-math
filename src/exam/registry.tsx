import type { ReactNode, ComponentType } from "react";
import type { ExamOperatorDef } from "./types";
import { M, texAns, texRed, texFrac } from "../problems/shared/M";
import { MixedMath } from "../problems/shared/MixedMath";
import { unicodeToLatex } from "../problems/shared/katex-utils";
import type { TextProblem } from "../problems/shared/types";
import type { FracProblem } from "../problems/fractions/types";
import type { FracCalcProblem } from "../problems/fractions/diff-frac";

// --- generators ---
import { generateDivision } from "../problems/computation/division";
import { generateMixedCalc } from "../problems/computation/mixed-calc";
import { generatePosNegAddSub } from "../problems/computation/pos-neg-add-sub";
import { generatePosNegMulDiv } from "../problems/computation/pos-neg-mul-div";
import { generatePosNegMixed } from "../problems/computation/pos-neg-mixed";
import { generatePolyAddSub } from "../problems/computation/poly-add-sub";
import { generateMonoMulDiv } from "../problems/computation/mono-mul-div";
import { generateFracMixedCalc } from "../problems/computation/frac-mixed-calc";
import { generateDivCheck } from "../problems/computation/div-check";
import { generateCalcTrick } from "../problems/computation/calc-trick";
import { generateEstimate } from "../problems/computation/estimate";
import { generateFracMul } from "../problems/fractions/frac-mul";
import { generateFracDiv } from "../problems/fractions/frac-div";
import { generateDiffFrac } from "../problems/fractions/diff-frac";
import { generateLinearExpr } from "../problems/equations/linear-expr";
import { generateExprValue } from "../problems/equations/expr-value";
import { generateBoxEq } from "../problems/equations/box-eq";
import { generateLiteralExpr } from "../problems/equations/literal-expr";
import { generateLinearEq } from "../problems/equations/linear-eq";
import { generateSimEq } from "../problems/equations/simultaneous-eq";
import { generateExpansion } from "../problems/equations/expansion";
import { generateFactoring } from "../problems/equations/factoring";
import { generateQuadEq } from "../problems/equations/quadratic-eq";
import { generateSqrt } from "../problems/numbers/square-root";
import { generatePrime } from "../problems/numbers/prime";
import { generateSpeed } from "../problems/measurement/speed";
import { generateUnitConv } from "../problems/measurement/unit-conv";
import { generateUnitConv3 } from "../problems/measurement/unit-conv3";
import { generateTimeCalc } from "../problems/measurement/time-calc";
import { generateTimeCalc3 } from "../problems/measurement/time-calc3";
import { generateUnitAmount } from "../problems/measurement/unit-amount";
import { generateAverage } from "../problems/measurement/average";
import { generatePercent } from "../problems/relations/percent";
import { generateRatio } from "../problems/relations/ratio";
import { generateProportion } from "../problems/relations/proportion-eq";
import { generateLinearFunc } from "../problems/relations/linear-func";
import { generateQuadFunc } from "../problems/relations/quadratic-func";
import { generateCounting } from "../problems/data/counting";
import { generateProbability } from "../problems/data/probability";
import { generateSampling } from "../problems/data/sampling";
import { generateSector } from "../problems/geometry/sector";
import { generatePolygonAngle } from "../problems/geometry/polygon-angle";
import { generateCircumference } from "../problems/geometry/circumference";
import { generateCircleArea } from "../problems/geometry/circle-area";
import { generatePythagorean } from "../problems/geometry/pythagorean";
import { generateAngle } from "../problems/geometry/angle";
import { generateArea } from "../problems/geometry/area";
import { generateAreaFormula } from "../problems/geometry/area-formula";
import { generateVolume } from "../problems/geometry/volume";
import { generateCircleRD } from "../problems/geometry/circle-rd";
import { generateTriAngle } from "../problems/geometry/triangle-angle";
import { generateParallelAngle } from "../problems/geometry/parallel-angle";
import { generateParallelogram } from "../problems/geometry/parallelogram";
import { generateSimilarity } from "../problems/geometry/similarity";
import { generateCircleAngle } from "../problems/geometry/circle-angle";
import { generateSolid } from "../problems/geometry/solid-volume";
import { generatePrismVolume } from "../problems/geometry/prism-volume";
import { generateScale } from "../problems/geometry/scale";
import { generateAreaUnit } from "../problems/geometry/area-unit";
import { generateTableRead } from "../problems/data/table-read";
import { generateBarGraph } from "../problems/data/bar-graph";
import { generateLineGraph } from "../problems/data/line-graph";
import { generateCrossTable } from "../problems/data/cross-table";
import { generateFreqTable } from "../problems/data/freq-table";
import { generateDataAnalysis } from "../problems/data/data-analysis";
import { generateRepresentative } from "../problems/data/representative";

// --- figure components ---
import AngleFig from "../problems/geometry/figures/angle-fig";
import AreaFig from "../problems/geometry/figures/area-fig";
import AreaFormulaFig from "../problems/geometry/figures/area-formula-fig";
import VolumeFig from "../problems/geometry/figures/volume-fig";
import CircleRDFig from "../problems/geometry/figures/circle-rd-fig";
import CircumferenceFig from "../problems/geometry/figures/circumference-fig";
import CircleAreaFig from "../problems/geometry/figures/circle-area-fig";
import SectorFig from "../problems/geometry/figures/sector-fig";
import PolygonAngleFig from "../problems/geometry/figures/polygon-angle-fig";
import PythagoreanFig from "../problems/geometry/figures/pythagorean-fig";
import TriangleAngleFig from "../problems/geometry/figures/triangle-angle-fig";
import ParallelAngleFig from "../problems/geometry/figures/parallel-angle-fig";
import ParallelogramFig from "../problems/geometry/figures/parallelogram-fig";
import SimilarityFig from "../problems/geometry/figures/similarity-fig";
import CircleAngleFig from "../problems/geometry/figures/circle-angle-fig";
import SolidVolumeFig from "../problems/geometry/figures/solid-volume-fig";
import PrismVolumeFig from "../problems/geometry/figures/prism-volume-fig";

// --- chart render helpers ---
import { renderBarChart } from "../problems/data/BarGraph";
import { renderLineChart } from "../problems/data/LineGraph";

// --- data types ---
import type { AngleProblem } from "../problems/geometry/angle";
import type { SectorProblem } from "../problems/geometry/sector";
import type { SolidProblem } from "../problems/geometry/solid-volume";
import type { TableReadProblem } from "../problems/data/table-read";
import type { BarGraphProblem } from "../problems/data/bar-graph";
import type { LineGraphProblem } from "../problems/data/line-graph";
import type { CrossTableProblem } from "../problems/data/cross-table";
import type { FreqTableProblem } from "../problems/data/freq-table";
import type { DataAnalysisProblem } from "../problems/data/data-analysis";
import type { RepresentativeProblem } from "../problems/data/representative";
import { generateIrrationalCalc } from "../problems/math1/irrational-calc";
import { generateQuadraticFactor } from "../problems/math1/quadratic-factor";
import { generateQuadraticFunc } from "../problems/math1/quadratic-func";
import { generateLinearInequality } from "../problems/math1/linear-inequality";
import { generateQuadraticEqIneq } from "../problems/math1/quadratic-eq-ineq";
import { generateTrigRatio } from "../problems/math1/trig-ratio";
import { generateCubicExpandFactor } from "../problems/math2/cubic-expand-factor";
import { generateComplexNumber } from "../problems/math2/complex-number";
import { generateExponent } from "../problems/math2/exponent";
import { generateLogCalc } from "../problems/math2/log-calc";
import { generateRadian } from "../problems/math2/radian";
import { generateGeneralAngle } from "../problems/math2/general-angle";
import { generateAdditionFormula } from "../problems/math2/addition-formula";
import { generateDoubleAngle } from "../problems/math2/double-angle";
import { generateTrigSynthesis } from "../problems/math2/trig-synthesis";
import { generateDerivativePoly } from "../problems/math2/derivative-poly";
import { generateTangentLine } from "../problems/math2/tangent-line";
import { generateIntegralPoly } from "../problems/math2/integral-poly";
import { generatePointDistance } from "../problems/math2/point-distance";
import { generateSectionPoint } from "../problems/math2/section-point";
import { generateLineEquation } from "../problems/math2/line-equation";
import { generatePointLineDistance } from "../problems/math2/point-line-distance";
import { generatePermComb } from "../problems/mathA/permutation-combination";
import { generateProbability as generateProbabilityA } from "../problems/mathA/probability";
import { generateEuclideanGcd } from "../problems/mathA/euclidean-gcd";
import { generateBaseConversion } from "../problems/mathA/base-conversion";
import { generateArithmeticSeq } from "../problems/mathB/arithmetic-seq";
import { generateGeometricSeq } from "../problems/mathB/geometric-seq";
import { generateSigmaSum } from "../problems/mathB/sigma-sum";
import { generateBinomialDist } from "../problems/mathB/binomial-dist";
import { generateNormalDist } from "../problems/mathB/normal-dist";
import { generateSeqLimit } from "../problems/math3/seq-limit";
import { generateProductQuotientDiff } from "../problems/math3/product-quotient-diff";
import { generateChainRuleDiff } from "../problems/math3/chain-rule-diff";
import { generateBasicDerivative } from "../problems/math3/basic-derivative";
import { generateBasicIntegral } from "../problems/math3/basic-integral";
import { generateSubstitutionIntegral } from "../problems/math3/substitution-integral";
import { generateByPartsIntegral } from "../problems/math3/by-parts-integral";
import { generateVectorCalc } from "../problems/mathC/vector-calc";
import { generateComplexPlane } from "../problems/mathC/complex-plane";
import { generateDecimalComp } from "../problems/fractions/decimal-comp";
import { generateDecimalShift } from "../problems/fractions/decimal-shift";

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

/** Template: { question, answerDisplay } with LaTeX answer */
const qaOperator = (
  opts: Omit<ExamOperatorDef, "generate" | "render"> & {
    gen: (seed: number, count: number) => { question: string; answerDisplay: string }[];
  },
): ExamOperatorDef => ({
  ...opts,
  generate: opts.gen,
  render: (problems, showAnswers) => (
    <div className="exam-text-list">
      {(problems as { question: string; answerDisplay: string }[]).map((p, i) => (
        <div key={i} className="exam-text-row">
          <span className="exam-num">({i + 1})</span>
          <span className="exam-text-q">{p.question}</span>
          <span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>
            <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
          </span>
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

/** Template: figure-based problems with SVG + Q/A */
const figOperator = <T,>(
  opts: Omit<ExamOperatorDef, "generate" | "render"> & {
    gen: (seed: number, count: number) => T[];
    FigComponent: ComponentType<{ problem: T }>;
    renderQA: (p: T, showAnswers: boolean) => ReactNode;
  },
): ExamOperatorDef => ({
  ...opts,
  generate: opts.gen,
  render: (problems, showAnswers) => (
    <div className="exam-fig-list">
      {(problems as T[]).map((p, i) => (
        <div key={i} className="exam-fig-block">
          <span className="exam-num">({i + 1})</span>
          <opts.FigComponent problem={p} />
          <div className="exam-fig-qa">{opts.renderQA(p, showAnswers)}</div>
        </div>
      ))}
    </div>
  ),
});

/** renderQA for { question, answer } (text answers) */
const figQA = (p: { question: string; answer: string }, showAnswers: boolean): ReactNode => (
  <>
    <span className="exam-text-q">{p.question}</span>
    <span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.answer}</span>
  </>
);

/** renderQA for { question, answerDisplay } (KaTeX answers) */
const figQADisplay = (p: { question: string; answerDisplay: string }, showAnswers: boolean): ReactNode => (
  <>
    <span className="exam-text-q">{p.question}</span>
    <span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>
      <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
    </span>
  </>
);

/** Build question text for SolidProblem */
const solidQuestion = (p: SolidProblem): string => {
  if (p.solidType === "cylinder")
    return `底面の半径 ${p.radius}cm、高さ ${p.height}cm の円柱の${p.calcType === "volume" ? "体積" : "表面積"}は？`;
  if (p.solidType === "cone") {
    if (p.calcType === "volume")
      return `底面の半径 ${p.radius}cm、高さ ${p.height}cm の円錐の体積は？`;
    return `底面の半径 ${p.radius}cm、母線の長さ ${p.slantHeight}cm の円錐の表面積は？`;
  }
  if (p.solidType === "sphere")
    return `半径 ${p.radius}cm の球の${p.calcType === "volume" ? "体積" : "表面積"}は？`;
  return `底面の一辺 ${p.baseEdge}cm の${p.baseSides === 4 ? "正四" : "三"}角柱（高さ ${p.height}cm）の体積は？`;
};

// ============================================================
// Operator definitions
// ============================================================

type DivP = { dividend: number; divisor: number; quotient: number; remainder: number };
type MixedCalcP = { display: string; answer: number };
type PosNegAddSubP = { terms: number[]; answer: number };
type PosNegMulDivP = { expr: string; answer: number };
type PosNegMixedP = { expr: string; answer: number };
type BoxEqP = { display: string; answer: number };
type ExprValueP = { expr: string; varDisplay: string; answer: number };
type LinearEqP = { equation: string; answer: number; isFraction: boolean; fracNum?: number; fracDen?: number };
type QuadEqP = { equation: string; answerDisplay: string };
type SqrtP = { expr: string; answerDisplay: string };
type PrimeP = { target: number; factorExpr: string };
type ProbabilityP = { question: string; ansNum: number; ansDen: number };
type DecimalCompP = { left: string; right: string; answer: string };

const formatPosNegTerms = (terms: number[]): string =>
  terms.map((t, j) => {
    const sign = j === 0 ? "" : (t >= 0 ? "+" : "-");
    const val = j === 0
      ? `(${t >= 0 ? "+" : ""}${t})`
      : `(${t >= 0 ? "+" : ""}${Math.abs(t)})`;
    return `${sign} ${val}`;
  }).join(" ");

const definitions: ExamOperatorDef[] = [
  // ============================================================
  // 計算
  // ============================================================
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
        expr: p.expr, answerExpr: String(p.answer),
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
        expr: p.expr, answerExpr: String(p.answer),
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
  textOperator({
    key: "computation/div-check",
    label: "わり算の検算",
    groupLabel: "計算",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateDivCheck(seed).slice(0, count),
  }),
  textOperator({
    key: "computation/calc-trick",
    label: "計算のくふう",
    groupLabel: "計算",
    instruction: "くふうして計算しなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateCalcTrick(seed).slice(0, count),
  }),
  textOperator({
    key: "computation/estimate",
    label: "見積もり",
    groupLabel: "計算",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateEstimate(seed, 100).slice(0, count),
  }),

  // ============================================================
  // 分数
  // ============================================================
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
  fracOperator({
    key: "fractions/frac-div",
    label: "分数のわり算",
    groupLabel: "分数",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    opSymbol: "÷",
    gen: (seed, count) => generateFracDiv(seed).slice(0, count),
  }),
  {
    key: "fractions/diff-frac",
    label: "異分母分数の加減",
    groupLabel: "分数",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    generate: (seed, count) => generateDiffFrac(seed, "mixed").slice(0, count),
    render: (problems, showAnswers) => (
      <div className="exam-grid exam-cols-2">
        {(problems as FracCalcProblem[]).map((p, i) => (
          <div key={i} className="exam-problem">
            <span className="exam-num">({i + 1})</span>
            <M tex={`\\frac{${p.aNum}}{${p.aDen}} ${p.op === "+" ? "+" : "-"} \\frac{${p.bNum}}{${p.bDen}} = ${showAnswers ? texRed(texFrac(p.ansNum, p.ansDen, p.ansWhole, p.ansPartNum)) : texAns("?", false)}`} />
          </div>
        ))}
      </div>
    ),
  },

  // ============================================================
  // 小数
  // ============================================================
  katexOperator({
    key: "decimals/decimal-comp",
    label: "小数の大小比較",
    groupLabel: "小数",
    instruction: "□にあてはまる記号（＞、＜、＝）を書きなさい。",
    defaultCount: 6,
    maxCount: 15,
    gen: (seed, count) => generateDecimalComp(seed, 10).slice(0, count),
    renderItem: (p, show) => {
      const d = p as DecimalCompP;
      const sym = show
        ? `\\boxed{\\textcolor{red}{${d.answer}}}`
        : `\\boxed{\\phantom{＞}}`;
      return `${d.left} ${sym} ${d.right}`;
    },
  }),
  textOperator({
    key: "decimals/decimal-shift",
    label: "小数点の移動",
    groupLabel: "小数",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateDecimalShift(seed).slice(0, count),
  }),

  // ============================================================
  // 式・方程式
  // ============================================================
  katexOperator({
    key: "equations/box-eq",
    label: "□を使った式",
    groupLabel: "式・方程式",
    instruction: "□にあてはまる数を求めなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateBoxEq(seed, "all").slice(0, count),
    renderItem: (p, show) => {
      const b = p as BoxEqP;
      const tex = b.display.replace("□", show
        ? `\\boxed{\\textcolor{red}{${b.answer}}}`
        : `\\boxed{\\phantom{${b.answer}}}`);
      return unicodeToLatex(tex);
    },
  }),
  textOperator({
    key: "equations/literal-expr",
    label: "文字式の値",
    groupLabel: "式・方程式",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateLiteralExpr(seed).slice(0, count),
  }),
  exprOperator({
    key: "equations/linear-expr",
    label: "一次式の計算",
    groupLabel: "式・方程式",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateLinearExpr(seed).slice(0, count),
  }),
  katexOperator({
    key: "equations/expr-value",
    label: "式の値",
    groupLabel: "式・方程式",
    instruction: "次の式の値を求めなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateExprValue(seed).slice(0, count),
    renderItem: (p, show) => {
      const ev = p as ExprValueP;
      return `${unicodeToLatex(ev.varDisplay)} \\text{ のとき } ${unicodeToLatex(ev.expr)} = ${texAns(ev.answer, show)}`;
    },
  }),
  katexOperator({
    key: "equations/linear-eq",
    label: "1次方程式",
    groupLabel: "式・方程式",
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
    groupLabel: "式・方程式",
    instruction: "次の連立方程式を解きなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateSimEq(seed).slice(0, count),
  }),
  exprOperator({
    key: "equations/expansion",
    label: "展開",
    groupLabel: "式・方程式",
    instruction: "次の式を展開しなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateExpansion(seed, "mixed", count),
  }),
  exprOperator({
    key: "equations/factoring",
    label: "因数分解",
    groupLabel: "式・方程式",
    instruction: "次の式を因数分解しなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateFactoring(seed, "mixed", count),
  }),
  katexOperator({
    key: "equations/quadratic-eq",
    label: "2次方程式",
    groupLabel: "式・方程式",
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

  // ============================================================
  // 数の性質
  // ============================================================
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
  katexOperator({
    key: "numbers/prime",
    label: "素因数分解",
    groupLabel: "数の性質",
    instruction: "次の数を素因数分解しなさい。",
    defaultCount: 6,
    maxCount: 10,
    gen: (seed, count) => generatePrime(seed, "factorize").slice(0, count),
    renderItem: (p, show) => {
      const pr = p as PrimeP;
      const ans = show ? `= ${texRed(unicodeToLatex(pr.factorExpr))}` : "=";
      return `${pr.target} ${ans}`;
    },
  }),

  // ============================================================
  // 図形
  // ============================================================
  figOperator({
    key: "geometry/angle",
    label: "角度",
    groupLabel: "図形",
    instruction: "次の角度を求めなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateAngle(seed).slice(0, count),
    FigComponent: AngleFig,
    renderQA: (p: AngleProblem, show) => (
      <>
        <M tex={`${unicodeToLatex(p.display)} = ${texAns(p.answer + "^{\\circ}", show)}`} />
      </>
    ),
  }),
  figOperator({
    key: "geometry/area",
    label: "面積（長方形）",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateArea(seed, "mixed").slice(0, count),
    FigComponent: AreaFig,
    renderQA: figQA,
  }),
  figOperator({
    key: "geometry/area-formula",
    label: "面積の公式",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateAreaFormula(seed, "mixed").slice(0, count),
    FigComponent: AreaFormulaFig,
    renderQA: figQA,
  }),
  figOperator({
    key: "geometry/volume",
    label: "体積（直方体）",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateVolume(seed, "mixed").slice(0, count),
    FigComponent: VolumeFig,
    renderQA: figQA,
  }),
  figOperator({
    key: "geometry/circumference",
    label: "円周",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateCircumference(seed, "mixed").slice(0, count),
    FigComponent: CircumferenceFig,
    renderQA: figQA,
  }),
  figOperator({
    key: "geometry/circle-area",
    label: "円の面積",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateCircleArea(seed, "mixed").slice(0, count),
    FigComponent: CircleAreaFig,
    renderQA: figQA,
  }),
  figOperator({
    key: "geometry/circle-rd",
    label: "半径と直径",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateCircleRD(seed).slice(0, count),
    FigComponent: CircleRDFig,
    renderQA: figQA,
  }),
  figOperator({
    key: "geometry/sector",
    label: "おうぎ形",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateSector(seed, "mixed").slice(0, count),
    FigComponent: SectorFig,
    renderQA: (p: SectorProblem, show) => (
      <>
        <span className="exam-text-q">{p.type === "arc" ? "弧の長さは？" : "面積は？"}</span>
        <span className={`exam-text-a${show ? "" : " ws-hidden"}`}>
          <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
        </span>
      </>
    ),
  }),
  figOperator({
    key: "geometry/polygon-angle",
    label: "多角形の角",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generatePolygonAngle(seed).slice(0, count),
    FigComponent: PolygonAngleFig,
    renderQA: figQADisplay,
  }),
  figOperator({
    key: "geometry/triangle-angle",
    label: "三角形の角",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateTriAngle(seed).slice(0, count),
    FigComponent: TriangleAngleFig,
    renderQA: figQADisplay,
  }),
  figOperator({
    key: "geometry/parallel-angle",
    label: "平行線と角",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateParallelAngle(seed).slice(0, count),
    FigComponent: ParallelAngleFig,
    renderQA: figQADisplay,
  }),
  figOperator({
    key: "geometry/parallelogram",
    label: "平行四辺形",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateParallelogram(seed).slice(0, count),
    FigComponent: ParallelogramFig,
    renderQA: figQADisplay,
  }),
  figOperator({
    key: "geometry/similarity",
    label: "相似",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateSimilarity(seed).slice(0, count),
    FigComponent: SimilarityFig,
    renderQA: figQADisplay,
  }),
  figOperator({
    key: "geometry/circle-angle",
    label: "円周角",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateCircleAngle(seed).slice(0, count),
    FigComponent: CircleAngleFig,
    renderQA: figQADisplay,
  }),
  figOperator({
    key: "geometry/pythagorean",
    label: "三平方の定理",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generatePythagorean(seed).slice(0, count),
    FigComponent: PythagoreanFig,
    renderQA: figQADisplay,
  }),
  figOperator({
    key: "geometry/solid-volume",
    label: "立体の体積",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generateSolid(seed).slice(0, count),
    FigComponent: SolidVolumeFig,
    renderQA: (p: SolidProblem, show) => (
      <>
        <span className="exam-text-q">{solidQuestion(p)}</span>
        <span className={`exam-text-a${show ? "" : " ws-hidden"}`}>
          <M tex={texRed(unicodeToLatex(p.answerDisplay))} />
        </span>
      </>
    ),
  }),
  figOperator({
    key: "geometry/prism-volume",
    label: "角柱・円柱の体積",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 6,
    gen: (seed, count) => generatePrismVolume(seed, "mixed").slice(0, count),
    FigComponent: PrismVolumeFig,
    renderQA: figQA,
  }),
  textOperator({
    key: "geometry/scale",
    label: "縮尺",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateScale(seed).slice(0, count),
  }),
  textOperator({
    key: "geometry/area-unit",
    label: "面積の単位",
    groupLabel: "図形",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateAreaUnit(seed, "mixed").slice(0, count),
  }),

  // ============================================================
  // 測定
  // ============================================================
  textOperator({
    key: "measurement/unit-conv",
    label: "単位の換算（2年）",
    groupLabel: "測定",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateUnitConv(seed, "mixed").slice(0, count),
  }),
  textOperator({
    key: "measurement/unit-conv3",
    label: "単位の換算（3年）",
    groupLabel: "測定",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateUnitConv3(seed, "mixed").slice(0, count),
  }),
  textOperator({
    key: "measurement/time-calc",
    label: "時刻と時間",
    groupLabel: "測定",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateTimeCalc(seed, "mixed").slice(0, count),
  }),
  textOperator({
    key: "measurement/time-calc3",
    label: "時刻と時間（3年）",
    groupLabel: "測定",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateTimeCalc3(seed, "mixed").slice(0, count),
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
  textOperator({
    key: "measurement/unit-amount",
    label: "単位量あたり",
    groupLabel: "測定",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateUnitAmount(seed).slice(0, count),
  }),
  textOperator({
    key: "measurement/average",
    label: "平均",
    groupLabel: "測定",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateAverage(seed, 5).slice(0, count),
  }),

  // ============================================================
  // 変化と関係
  // ============================================================
  textOperator({
    key: "relations/percent",
    label: "割合と百分率",
    groupLabel: "変化と関係",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generatePercent(seed, "mixed").slice(0, count),
  }),
  textOperator({
    key: "relations/ratio",
    label: "比",
    groupLabel: "変化と関係",
    instruction: "次の問題に答えなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateRatio(seed, "mixed").slice(0, count),
  }),
  qaOperator({
    key: "relations/proportion-eq",
    label: "比例・反比例",
    groupLabel: "変化と関係",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateProportion(seed).slice(0, count) as { question: string; answerDisplay: string }[],
  }),
  qaOperator({
    key: "relations/linear-func",
    label: "一次関数",
    groupLabel: "変化と関係",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 12,
    gen: (seed, count) => generateLinearFunc(seed).slice(0, count) as { question: string; answerDisplay: string }[],
  }),
  qaOperator({
    key: "relations/quadratic-func",
    label: "関数 y=ax²",
    groupLabel: "変化と関係",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateQuadFunc(seed).slice(0, count) as { question: string; answerDisplay: string }[],
  }),

  // ============================================================
  // データ・統計
  // ============================================================
  textOperator({
    key: "data/counting",
    label: "場合の数",
    groupLabel: "データ・統計",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateCounting(seed).slice(0, count),
  }),
  {
    key: "data/probability",
    label: "確率",
    groupLabel: "データ・統計",
    instruction: "次の確率を求めなさい。",
    defaultCount: 5,
    maxCount: 10,
    generate: (seed, count) => generateProbability(seed).slice(0, count),
    render: (problems, showAnswers) => (
      <div className="exam-text-list">
        {(problems as ProbabilityP[]).map((p, i) => (
          <div key={i} className="exam-text-row">
            <span className="exam-num">({i + 1})</span>
            <span className="exam-text-q">{p.question}</span>
            <span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>
              <M tex={texRed(p.ansDen === 1 ? String(p.ansNum) : `\\frac{${p.ansNum}}{${p.ansDen}}`)} />
            </span>
          </div>
        ))}
      </div>
    ),
  },
  qaOperator({
    key: "data/sampling",
    label: "標本調査",
    groupLabel: "データ・統計",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateSampling(seed).slice(0, count) as { question: string; answerDisplay: string }[],
  }),
  {
    key: "data/table-read",
    label: "表の読み取り",
    groupLabel: "データ・統計",
    instruction: "表を見て、次の問題に答えなさい。",
    defaultCount: 3,
    maxCount: 3,
    generate: (seed, count) => generateTableRead(seed, 4).slice(0, count),
    render: (problems, showAnswers) => (
      <div className="exam-text-list">
        {(problems as TableReadProblem[]).map((p, i) => (
          <div key={i} className="exam-data-block">
            <span className="exam-num">({i + 1}) {p.title}</span>
            <table className="exam-data-table">
              <thead><tr>{p.categories.map((c, j) => <th key={j}>{c}</th>)}</tr></thead>
              <tbody><tr>{p.values.map((v, j) => <td key={j}>{v}</td>)}</tr></tbody>
            </table>
            {p.questions.map((q, j) => (
              <div key={j} className="exam-data-sub">
                <span className="exam-text-q">{q.question}</span>
                <span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{q.answer}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "data/bar-graph",
    label: "棒グラフ",
    groupLabel: "データ・統計",
    instruction: "グラフを見て、次の問題に答えなさい。",
    defaultCount: 2,
    maxCount: 3,
    generate: (seed, count) => generateBarGraph(seed, 4).slice(0, count),
    render: (problems, showAnswers) => (
      <div className="exam-text-list">
        {(problems as BarGraphProblem[]).map((p, i) => (
          <div key={i} className="exam-data-block">
            <span className="exam-num">({i + 1}) {p.title}</span>
            {renderBarChart(p)}
            {p.questions.map((q, j) => (
              <div key={j} className="exam-data-sub">
                <span className="exam-text-q">{q.question}</span>
                <span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{q.answer}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "data/line-graph",
    label: "折れ線グラフ",
    groupLabel: "データ・統計",
    instruction: "グラフを見て、次の問題に答えなさい。",
    defaultCount: 2,
    maxCount: 3,
    generate: (seed, count) => generateLineGraph(seed).slice(0, count),
    render: (problems, showAnswers) => (
      <div className="exam-text-list">
        {(problems as LineGraphProblem[]).map((p, i) => (
          <div key={i} className="exam-data-block">
            <span className="exam-num">({i + 1}) {p.title}</span>
            {renderLineChart(p)}
            {p.questions.map((q, j) => (
              <div key={j} className="exam-data-sub">
                <span className="exam-text-q">{q.question}</span>
                <span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{q.answer}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "data/cross-table",
    label: "クロス集計表",
    groupLabel: "データ・統計",
    instruction: "表の空欄をうめなさい。",
    defaultCount: 3,
    maxCount: 4,
    generate: (seed, count) => generateCrossTable(seed).slice(0, count),
    render: (problems, showAnswers) => (
      <div className="exam-text-list">
        {(problems as CrossTableProblem[]).map((p, i) => {
          let ansIdx = 0;
          return (
            <div key={i} className="exam-data-block">
              <span className="exam-num">({i + 1}) {p.title}</span>
              <table className="exam-data-table">
                <thead><tr><th></th>{p.colLabels.map((col, j) => <th key={j}>{col}</th>)}</tr></thead>
                <tbody>
                  {p.rowLabels.map((row, r) => (
                    <tr key={r}>
                      <td><strong>{row}</strong></td>
                      {p.cells[r].map((cell, c) => {
                        if (cell !== null) return <td key={c}>{cell}</td>;
                        const ans = p.answers[ansIdx++];
                        return (
                          <td key={c} className="exam-data-blank">
                            <span className={showAnswers ? "" : "ws-hidden"}>
                              <span className="exam-text-a">{ans}</span>
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    key: "data/freq-table",
    label: "度数分布表",
    groupLabel: "データ・統計",
    instruction: "度数分布表の空欄をうめなさい。",
    defaultCount: 3,
    maxCount: 4,
    generate: (seed, count) => generateFreqTable(seed).slice(0, count),
    render: (problems, showAnswers) => (
      <div className="exam-text-list">
        {(problems as FreqTableProblem[]).map((p, i) => {
          let ansIdx = 0;
          return (
            <div key={i} className="exam-data-block">
              <span className="exam-num">({i + 1}) データ: {p.data.join(", ")}</span>
              <table className="exam-data-table">
                <thead><tr><th>階級</th><th>度数</th></tr></thead>
                <tbody>
                  {p.classes.map((cls, j) => {
                    const freq = p.frequencies[j];
                    if (freq !== null) return <tr key={j}><td>{cls}</td><td>{freq}</td></tr>;
                    const ans = p.answers[ansIdx++];
                    return (
                      <tr key={j}>
                        <td>{cls}</td>
                        <td className="exam-data-blank">
                          <span className={showAnswers ? "" : "ws-hidden"}>
                            <span className="exam-text-a">{ans}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    key: "data/data-analysis",
    label: "データの分析",
    groupLabel: "データ・統計",
    instruction: "次の問題に答えなさい。",
    defaultCount: 3,
    maxCount: 4,
    generate: (seed, count) => generateDataAnalysis(seed, "mixed").slice(0, count),
    render: (problems, showAnswers) => (
      <div className="exam-text-list">
        {(problems as DataAnalysisProblem[]).map((p, i) => {
          if (p.mode === "representative") {
            return (
              <div key={i} className="exam-data-block">
                <span className="exam-num">({i + 1}) データ: {p.data.join(", ")}</span>
                <div className="exam-data-sub"><span className="exam-text-q">平均値:</span><span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.mean}</span></div>
                <div className="exam-data-sub"><span className="exam-text-q">中央値:</span><span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.median}</span></div>
                <div className="exam-data-sub"><span className="exam-text-q">最頻値:</span><span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.modeValue}</span></div>
                <div className="exam-data-sub"><span className="exam-text-q">範囲:</span><span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.range}</span></div>
              </div>
            );
          }
          return (
            <div key={i} className="exam-data-block">
              <span className="exam-num">({i + 1}) 度数分布表を完成させなさい（合計 {p.total} 人）</span>
              <table className="exam-data-table">
                <thead><tr><th>階級</th><th>度数</th><th>相対度数</th><th>累積度数</th></tr></thead>
                <tbody>
                  {p.classes.map((cls, j) => {
                    const hidden = p.hiddenIndices.includes(j);
                    return (
                      <tr key={j}>
                        <td>{cls[0]}以上{cls[1]}未満</td>
                        <td className={hidden ? "exam-data-blank" : ""}>
                          {hidden
                            ? <span className={showAnswers ? "" : "ws-hidden"}><span className="exam-text-a">{p.frequencies[j]}</span></span>
                            : p.frequencies[j]}
                        </td>
                        <td>{p.relativeFrequencies[j].toFixed(2)}</td>
                        <td>{p.cumulativeFrequencies[j]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    key: "data/representative",
    label: "代表値",
    groupLabel: "データ・統計",
    instruction: "次のデータの代表値を求めなさい。",
    defaultCount: 4,
    maxCount: 8,
    generate: (seed, count) => generateRepresentative(seed).slice(0, count),
    render: (problems, showAnswers) => (
      <div className="exam-text-list">
        {(problems as RepresentativeProblem[]).map((p, i) => (
          <div key={i} className="exam-data-block">
            <span className="exam-num">({i + 1}) データ: {p.data.join(", ")}</span>
            <div className="exam-data-sub"><span className="exam-text-q">平均値:</span><span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.meanAnswer}</span></div>
            <div className="exam-data-sub"><span className="exam-text-q">中央値:</span><span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.medianAnswer}</span></div>
            <div className="exam-data-sub"><span className="exam-text-q">最頻値:</span><span className={`exam-text-a${showAnswers ? "" : " ws-hidden"}`}>{p.modeAnswer}</span></div>
          </div>
        ))}
      </div>
    ),
  },

  // ============================================================
  // 数学I
  // ============================================================
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
    key: "math1/quadratic-factor",
    label: "展開と因数分解",
    groupLabel: "数学I",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateQuadraticFactor(seed, "mixed", count),
  }),
  exprOperator({
    key: "math1/quadratic-func",
    label: "二次関数",
    groupLabel: "数学I",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateQuadraticFunc(seed, "mixed", count),
  }),
  exprOperator({
    key: "math1/linear-inequality",
    label: "一次不等式",
    groupLabel: "数学I",
    instruction: "次の不等式を解きなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateLinearInequality(seed, "mixed", count),
  }),
  exprOperator({
    key: "math1/quadratic-eq-ineq",
    label: "二次方程式・不等式",
    groupLabel: "数学I",
    instruction: "次の問題を解きなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateQuadraticEqIneq(seed, "mixed", count),
  }),
  exprOperator({
    key: "math1/trig-ratio",
    label: "三角比",
    groupLabel: "数学I",
    instruction: "次の問題に答えなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateTrigRatio(seed, "mixed", count),
  }),

  // ============================================================
  // 数学A
  // ============================================================
  exprOperator({
    key: "mathA/permutation-combination",
    label: "順列・組合せ",
    groupLabel: "数学A",
    instruction: "次の問題に答えなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generatePermComb(seed, "mixed", count),
  }),
  exprOperator({
    key: "mathA/probability",
    label: "確率",
    groupLabel: "数学A",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateProbabilityA(seed, "mixed", count),
  }),
  exprOperator({
    key: "mathA/euclidean-gcd",
    label: "ユークリッドの互除法",
    groupLabel: "数学A",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateEuclideanGcd(seed, "mixed", count),
  }),
  exprOperator({
    key: "mathA/base-conversion",
    label: "n進法",
    groupLabel: "数学A",
    instruction: "次の問題に答えなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateBaseConversion(seed, "mixed", count),
  }),

  // ============================================================
  // 数学II
  // ============================================================
  exprOperator({
    key: "math2/cubic-expand-factor",
    label: "三次式の展開・因数分解",
    groupLabel: "数学II",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateCubicExpandFactor(seed, "mixed", count),
  }),
  exprOperator({
    key: "math2/complex-number",
    label: "複素数と方程式",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateComplexNumber(seed, "mixed", count),
  }),
  exprOperator({
    key: "math2/exponent",
    label: "指数の拡張",
    groupLabel: "数学II",
    instruction: "次の計算をしなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateExponent(seed, "mixed", count),
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
    key: "math2/radian",
    label: "弧度法",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 6,
    maxCount: 12,
    gen: (seed, count) => generateRadian(seed, "mixed", count),
  }),
  exprOperator({
    key: "math2/general-angle",
    label: "一般角",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateGeneralAngle(seed, count),
  }),
  exprOperator({
    key: "math2/addition-formula",
    label: "加法定理",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateAdditionFormula(seed, count),
  }),
  exprOperator({
    key: "math2/double-angle",
    label: "倍角公式",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateDoubleAngle(seed, count),
  }),
  exprOperator({
    key: "math2/trig-synthesis",
    label: "三角関数の合成",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateTrigSynthesis(seed, count),
  }),
  exprOperator({
    key: "math2/derivative-poly",
    label: "微分計算・極値",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateDerivativePoly(seed, "mixed", count),
  }),
  exprOperator({
    key: "math2/tangent-line",
    label: "接線の方程式",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateTangentLine(seed, "mixed", count),
  }),
  exprOperator({
    key: "math2/integral-poly",
    label: "多項式の積分",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateIntegralPoly(seed, "mixed", count),
  }),
  exprOperator({
    key: "math2/point-distance",
    label: "2点間の距離",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generatePointDistance(seed, count),
  }),
  exprOperator({
    key: "math2/section-point",
    label: "内分点",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateSectionPoint(seed, count),
  }),
  exprOperator({
    key: "math2/line-equation",
    label: "直線の方程式",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateLineEquation(seed, count),
  }),
  exprOperator({
    key: "math2/point-line-distance",
    label: "点と直線の距離",
    groupLabel: "数学II",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generatePointLineDistance(seed, count),
  }),

  // ============================================================
  // 数学B
  // ============================================================
  exprOperator({
    key: "mathB/arithmetic-seq",
    label: "等差数列",
    groupLabel: "数学B",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateArithmeticSeq(seed, count),
  }),
  exprOperator({
    key: "mathB/geometric-seq",
    label: "等比数列",
    groupLabel: "数学B",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateGeometricSeq(seed, count),
  }),
  exprOperator({
    key: "mathB/sigma-sum",
    label: "Σ計算",
    groupLabel: "数学B",
    instruction: "次の計算をしなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateSigmaSum(seed, count),
  }),
  exprOperator({
    key: "mathB/binomial-dist",
    label: "二項分布",
    groupLabel: "数学B",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateBinomialDist(seed, "mixed", count),
  }),
  exprOperator({
    key: "mathB/normal-dist",
    label: "正規分布",
    groupLabel: "数学B",
    instruction: "次の問題に答えなさい。",
    defaultCount: 4,
    maxCount: 8,
    gen: (seed, count) => generateNormalDist(seed, "mixed", count),
  }),

  // ============================================================
  // 数学III
  // ============================================================
  exprOperator({
    key: "math3/seq-limit",
    label: "数列の極限",
    groupLabel: "数学III",
    instruction: "次の極限を求めなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateSeqLimit(seed, "mixed", count),
  }),
  exprOperator({
    key: "math3/basic-derivative",
    label: "基本微分",
    groupLabel: "数学III",
    instruction: "次の関数を微分しなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateBasicDerivative(seed, "mixed", count),
  }),
  exprOperator({
    key: "math3/product-quotient-diff",
    label: "積・商の微分",
    groupLabel: "数学III",
    instruction: "次の関数を微分しなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateProductQuotientDiff(seed, "mixed", count),
  }),
  exprOperator({
    key: "math3/chain-rule-diff",
    label: "合成関数の微分",
    groupLabel: "数学III",
    instruction: "次の関数を微分しなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateChainRuleDiff(seed, "mixed", count),
  }),
  exprOperator({
    key: "math3/basic-integral",
    label: "基本積分",
    groupLabel: "数学III",
    instruction: "次の不定積分を求めなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateBasicIntegral(seed, "mixed", count),
  }),
  exprOperator({
    key: "math3/substitution-integral",
    label: "置換積分",
    groupLabel: "数学III",
    instruction: "次の不定積分を求めなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateSubstitutionIntegral(seed, "mixed", count),
  }),
  exprOperator({
    key: "math3/by-parts-integral",
    label: "部分積分",
    groupLabel: "数学III",
    instruction: "次の不定積分を求めなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateByPartsIntegral(seed, "mixed", count),
  }),

  // ============================================================
  // 数学C
  // ============================================================
  exprOperator({
    key: "mathC/vector-calc",
    label: "ベクトルの演算",
    groupLabel: "数学C",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateVectorCalc(seed, "mixed", count),
  }),
  exprOperator({
    key: "mathC/complex-plane",
    label: "複素数平面",
    groupLabel: "数学C",
    instruction: "次の問題に答えなさい。",
    defaultCount: 5,
    maxCount: 10,
    gen: (seed, count) => generateComplexPlane(seed, "mixed", count),
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
