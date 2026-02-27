import { mulberry32 } from "../random";
import { nCr } from "../shared/latex-format";

export type CubicMode = "expand" | "factor" | "binomial-theorem" | "mixed";

export interface CubicProblem {
  expr: string;
  answerExpr: string;
}

export const generateCubicExpandFactor = (
  seed: number,
  mode: CubicMode = "mixed",
  count = 12,
): CubicProblem[] => {
  const rng = mulberry32(seed);
  const problems: CubicProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: CubicProblem | null = null;
      if (pick === "expand") result = generateExpand(rng);
      else if (pick === "factor") result = generateFactor(rng);
      else result = generateBinomialTheorem(rng);

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

const pickMode = (rng: () => number, mode: CubicMode): "expand" | "factor" | "binomial-theorem" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "expand";
  if (r < 0.7) return "factor";
  return "binomial-theorem";
};

const generateExpand = (rng: () => number): CubicProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // (a + b)³ = a³ + 3a²b + 3ab² + b³
    const a = Math.floor(rng() * 3) + 1; // [1..3]
    const b = Math.floor(rng() * 5) + 1; // [1..5]
    const sign = rng() < 0.5;
    const op = sign ? "+" : "−";
    const bDisp = b;

    const a3 = a * a * a;
    const a2b = 3 * a * a * b;
    const ab2 = 3 * a * b * b;
    const b3 = b * b * b;

    const aStr = a === 1 ? "x" : `${a}x`;
    const expr = `(${aStr} ${op} ${bDisp})³`;

    if (sign) {
      const answerExpr = formatCubicResult(a3, a2b, ab2, b3);
      return { expr, answerExpr };
    } else {
      const answerExpr = formatCubicResult(a3, -a2b, ab2, -b3);
      return { expr, answerExpr };
    }
  }

  if (variant === 1) {
    // (a + b)(a² - ab + b²) = a³ + b³
    const a = Math.floor(rng() * 3) + 1;
    const b = Math.floor(rng() * 4) + 1;
    const aStr = a === 1 ? "x" : `${a}x`;
    const a2 = a * a;
    const ab = a * b;
    const b2 = b * b;

    const expr = `(${aStr} + ${b})(${fmtTerm(a2, "x²")} − ${ab}x + ${b2})`;
    const answerExpr = `${fmtTerm(a * a * a, "x³")} + ${b * b * b}`;
    return { expr, answerExpr };
  }

  // (a - b)(a² + ab + b²) = a³ - b³
  const a = Math.floor(rng() * 3) + 1;
  const b = Math.floor(rng() * 4) + 1;
  const aStr = a === 1 ? "x" : `${a}x`;
  const a2 = a * a;
  const ab = a * b;
  const b2 = b * b;

  const expr = `(${aStr} − ${b})(${fmtTerm(a2, "x²")} + ${ab}x + ${b2})`;
  const answerExpr = `${fmtTerm(a * a * a, "x³")} − ${b * b * b}`;
  return { expr, answerExpr };
};

const generateFactor = (rng: () => number): CubicProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // x³ + b³ = (x + b)(x² - bx + b²) — sum of cubes
    const b = Math.floor(rng() * 4) + 1; // [1..4]
    const b3 = b * b * b;
    const expr = `x³ + ${b3}`;
    const answerExpr = `(x + ${b})(x² − ${b}x + ${b * b})`;
    return { expr, answerExpr };
  }

  if (variant === 1) {
    // x³ - b³ = (x - b)(x² + bx + b²) — difference of cubes
    const b = Math.floor(rng() * 4) + 1;
    const b3 = b * b * b;
    const expr = `x³ − ${b3}`;
    const answerExpr = `(x − ${b})(x² + ${b}x + ${b * b})`;
    return { expr, answerExpr };
  }

  // a³x³ ± b³ with a > 1
  const a = Math.floor(rng() * 2) + 2; // [2..3]
  const b = Math.floor(rng() * 3) + 1; // [1..3]
  const isPlus = rng() < 0.5;
  const a3 = a * a * a;
  const b3 = b * b * b;

  if (isPlus) {
    const expr = `${a3}x³ + ${b3}`;
    const answerExpr = `(${a}x + ${b})(${a * a}x² − ${a * b}x + ${b * b})`;
    return { expr, answerExpr };
  }
  const expr = `${a3}x³ − ${b3}`;
  const answerExpr = `(${a}x − ${b})(${a * a}x² + ${a * b}x + ${b * b})`;
  return { expr, answerExpr };
};

const generateBinomialTheorem = (rng: () => number): CubicProblem | null => {
  // Find coefficient of x^k in (ax + b)^n
  const n = Math.floor(rng() * 3) + 3; // [3..5]
  const a = Math.floor(rng() * 2) + 1; // [1..2]
  const b = Math.floor(rng() * 5) + 1; // [1..5]
  const k = Math.floor(rng() * (n - 1)) + 1; // [1..n-1]

  // Coefficient of x^k in (ax+b)^n = nCk * a^k * b^(n-k)
  const coeff = nCr(n, k) * Math.pow(a, k) * Math.pow(b, n - k);

  const aStr = a === 1 ? "x" : `${a}x`;
  const expr = `(${aStr} + ${b})${superscript(n)} の x${superscript(k)} の係数`;
  const answerExpr = `${coeff}`;

  return { expr, answerExpr };
};

const formatCubicResult = (a3: number, a2b: number, ab2: number, b3: number): string => {
  const parts: string[] = [];
  addTerm(parts, a3, "x³");
  addTerm(parts, a2b, "x²");
  addTerm(parts, ab2, "x");
  addConst(parts, b3);
  return parts.join(" ");
};

const addTerm = (parts: string[], coeff: number, varPart: string) => {
  if (coeff === 0) return;
  const isFirst = parts.length === 0;
  const abs = Math.abs(coeff);
  if (isFirst) {
    if (abs === 1) parts.push(coeff < 0 ? `−${varPart}` : varPart);
    else parts.push(coeff < 0 ? `−${abs}${varPart}` : `${abs}${varPart}`);
  } else {
    if (abs === 1) parts.push(coeff < 0 ? `− ${varPart}` : `+ ${varPart}`);
    else parts.push(coeff < 0 ? `− ${abs}${varPart}` : `+ ${abs}${varPart}`);
  }
};

const addConst = (parts: string[], c: number) => {
  if (c === 0) return;
  if (parts.length === 0) { parts.push(`${c}`); return; }
  parts.push(c > 0 ? `+ ${c}` : `− ${Math.abs(c)}`);
};

const fmtTerm = (coeff: number, varPart: string): string =>
  coeff === 1 ? varPart : `${coeff}${varPart}`;

const superscript = (n: number): string => {
  const sup: Record<number, string> = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
  return sup[n] ?? `^${n}`;
};
