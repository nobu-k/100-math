import { mulberry32 } from "../random";
import { type Poly, polyDeriv, polyEval, formatPoly } from "../shared/poly-utils";

export type FuncType = "polynomial" | "trig" | "exponential" | "logarithmic" | "mixed";

export interface TangentLineProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateTangentLine = (
  seed: number,
  funcType: FuncType = "mixed",
  count = 10,
): TangentLineProblem[] => {
  const rng = mulberry32(seed);
  const problems: TangentLineProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = generateOne(rng, funcType);
      if (!result) continue;

      const key = result.expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push(result);
        break;
      }
    }
  }
  return problems;
};

const generateOne = (rng: () => number, funcType: FuncType): TangentLineProblem | null => {
  if (funcType === "mixed") {
    const variant = Math.floor(rng() * 4);
    if (variant === 0) return genPoly(rng);
    if (variant === 1) return genTrig(rng);
    if (variant === 2) return genExp(rng);
    return genLog(rng);
  }
  if (funcType === "polynomial") return genPoly(rng);
  if (funcType === "trig") return genTrig(rng);
  if (funcType === "exponential") return genExp(rng);
  return genLog(rng);
};

const genPoly = (rng: () => number): TangentLineProblem | null => {
  const a = Math.floor(rng() * 5) - 2;
  const c3 = Math.floor(rng() * 3) + 1;
  const c2 = Math.floor(rng() * 7) - 3;
  const c1 = Math.floor(rng() * 7) - 3;
  const c0 = Math.floor(rng() * 7) - 3;

  const coeffs: Poly = [c0, c1, c2, c3];
  const deriv = polyDeriv(coeffs);

  const fa = polyEval(coeffs, a);
  const fpa = polyEval(deriv, a);

  const slope = fpa;
  const intercept = fa - a * fpa;

  const aStr = a < 0 ? `−${Math.abs(a)}` : `${a}`;
  const expr = `f(x) = ${formatPoly(coeffs)} の x = ${aStr} における接線の方程式`;
  const answerExpr = formatTangent(slope, intercept);
  return { expr, answerExpr, isNL: true };
};

const genTrig = (rng: () => number): TangentLineProblem | null => {
  // Tangent line of y=sin(x) or y=cos(x) at points where slope and value are clean
  const cases: { func: string; x: string; slope: string; y: string }[] = [
    { func: "sin x", x: "0", slope: "1", y: "0" },
    { func: "sin x", x: "π", slope: "−1", y: "0" },
    { func: "sin x", x: "π/2", slope: "0", y: "1" },
    { func: "cos x", x: "0", slope: "0", y: "1" },
    { func: "cos x", x: "π", slope: "0", y: "−1" },
    { func: "cos x", x: "π/2", slope: "−1", y: "0" },
  ];

  const c = cases[Math.floor(rng() * cases.length)];
  const expr = `y = ${c.func} の x = ${c.x} における接線の方程式`;

  let answerExpr: string;
  if (c.slope === "0") {
    answerExpr = `y = ${c.y}`;
  } else if (c.slope === "1") {
    if (c.x === "0") answerExpr = "y = x";
    else answerExpr = `y = x − ${c.x} + ${c.y}`;
  } else if (c.slope === "−1") {
    if (c.x === "0") answerExpr = "y = −x";
    else if (c.x === "π") answerExpr = "y = −x + π";
    else answerExpr = `y = −(x − ${c.x}) + ${c.y}`;
  } else {
    answerExpr = `y = ${c.slope}(x − ${c.x}) + ${c.y}`;
  }

  return { expr, answerExpr, isNL: true };
};

const genExp = (rng: () => number): TangentLineProblem => {
  // y = eˣ at x = a (integer)
  const a = Math.floor(rng() * 3) - 1; // [-1, 0, 1]

  if (a === 0) {
    // slope = e⁰ = 1, y(0) = 1, tangent: y = x + 1
    return { expr: "y = eˣ の x = 0 における接線の方程式", answerExpr: "y = x + 1", isNL: true };
  }
  if (a === 1) {
    // slope = e, y(1) = e, tangent: y = e(x-1) + e = ex
    return { expr: "y = eˣ の x = 1 における接線の方程式", answerExpr: "y = ex", isNL: true };
  }
  // a = -1: slope = 1/e, y(-1) = 1/e, tangent: y = (1/e)(x+1) + 1/e = (1/e)x + 2/e
  return { expr: "y = eˣ の x = −1 における接線の方程式", answerExpr: "y = (1/e)x + 2/e", isNL: true };
};

const genLog = (rng: () => number): TangentLineProblem => {
  // y = ln x at x = a (positive integer)
  const cases: { x: string; ans: string }[] = [
    { x: "1", ans: "y = x − 1" },           // slope=1, y=0, tangent: y = x - 1
    { x: "e", ans: "y = (1/e)x" },           // slope=1/e, y=1, tangent: y = (1/e)(x-e)+1 = (1/e)x
    { x: "e²", ans: "y = (1/e²)x + 1" },    // slope=1/e², y=2, tangent: y = (1/e²)(x-e²)+2 = (1/e²)x+1
  ];

  const c = cases[Math.floor(rng() * cases.length)];
  return { expr: `y = ln x の x = ${c.x} における接線の方程式`, answerExpr: c.ans, isNL: true };
};

const formatTangent = (slope: number, intercept: number): string => {
  if (slope === 0) {
    return `y = ${intercept < 0 ? `−${Math.abs(intercept)}` : intercept}`;
  }
  const slopeStr = slope === 1 ? "x" : slope === -1 ? "−x" : `${slope}x`;
  if (intercept === 0) return `y = ${slopeStr}`;
  if (intercept > 0) return `y = ${slopeStr} + ${intercept}`;
  return `y = ${slopeStr} − ${Math.abs(intercept)}`;
};
