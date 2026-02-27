import { mulberry32 } from "../random";
import { type Poly, polyDeriv, polyEval, formatPoly } from "../shared/poly-utils";

export type DerivativePolyMode = "differentiate" | "tangent-line" | "extrema" | "mixed";

export interface DerivativePolyProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateDerivativePoly = (
  seed: number,
  mode: DerivativePolyMode = "mixed",
  count = 10,
): DerivativePolyProblem[] => {
  const rng = mulberry32(seed);
  const problems: DerivativePolyProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: DerivativePolyProblem | null = null;
      if (pick === "differentiate") result = generateDifferentiate(rng);
      else if (pick === "tangent-line") result = generateTangentLine(rng);
      else result = generateExtrema(rng);

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

const pickMode = (rng: () => number, mode: DerivativePolyMode): "differentiate" | "tangent-line" | "extrema" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.4) return "differentiate";
  if (r < 0.7) return "tangent-line";
  return "extrema";
};

const generateDifferentiate = (rng: () => number): DerivativePolyProblem | null => {
  // f(x) = ax³ + bx² + cx + d → f'(x)
  const deg = Math.floor(rng() * 2) + 2; // degree 2 or 3
  const coeffs: Poly = [];
  for (let i = 0; i <= deg; i++) {
    coeffs.push(Math.floor(rng() * 11) - 5); // [-5..5]
  }
  // Ensure leading coefficient is non-zero
  if (coeffs[deg] === 0) coeffs[deg] = 1;

  const deriv = polyDeriv(coeffs);

  const expr = `f(x) = ${formatPoly(coeffs)} を微分せよ`;
  const answerExpr = `f'(x) = ${formatPoly(deriv)}`;
  return { expr, answerExpr, isNL: true };
};

const generateTangentLine = (rng: () => number): DerivativePolyProblem | null => {
  // Find tangent line at x=a for a cubic or quadratic
  const a = Math.floor(rng() * 5) - 2; // [-2..2]

  // Generate from nice coefficients
  const c3 = Math.floor(rng() * 3) + 1; // [1..3]
  const c2 = Math.floor(rng() * 7) - 3; // [-3..3]
  const c1 = Math.floor(rng() * 7) - 3;
  const c0 = Math.floor(rng() * 7) - 3;

  const coeffs: Poly = [c0, c1, c2, c3];
  const deriv = polyDeriv(coeffs);

  const fa = polyEval(coeffs, a);
  const fpa = polyEval(deriv, a);

  // Tangent: y = f'(a)(x - a) + f(a) = f'(a)x + (f(a) - a·f'(a))
  const slope = fpa;
  const intercept = fa - a * fpa;

  const aStr = a < 0 ? `−${Math.abs(a)}` : `${a}`;
  const expr = `f(x) = ${formatPoly(coeffs)} の x = ${aStr} における接線の方程式`;

  let answerExpr: string;
  if (slope === 0) {
    answerExpr = `y = ${intercept < 0 ? `−${Math.abs(intercept)}` : intercept}`;
  } else {
    const slopeStr = slope === 1 ? "x" : slope === -1 ? "−x" : `${slope}x`;
    if (intercept === 0) {
      answerExpr = `y = ${slopeStr}`;
    } else if (intercept > 0) {
      answerExpr = `y = ${slopeStr} + ${intercept}`;
    } else {
      answerExpr = `y = ${slopeStr} − ${Math.abs(intercept)}`;
    }
  }

  return { expr, answerExpr, isNL: true };
};

const generateExtrema = (rng: () => number): DerivativePolyProblem | null => {
  // Cubic with integer critical points: f'(x) = a(x-p)(x-q)
  // ensures nice critical points
  const a = Math.floor(rng() * 2) + 1; // [1..2] (leading coeff of f' / 2 → actually a*3 for f)
  let p = Math.floor(rng() * 5) - 2; // [-2..2]
  let q = Math.floor(rng() * 5) - 2;
  if (p === q) q = p + 2;
  if (p > q) [p, q] = [q, p];

  // f'(x) = 3a(x-p)(x-q) = 3a[x² - (p+q)x + pq]
  // f(x) = a[x³ - (3(p+q)/2)x² + 3pq·x] + c
  // To get integer coefficients: multiply through
  // Actually: f'(x) = 3ax² - 3a(p+q)x + 3apq
  // f(x) = ax³ - (3a(p+q)/2)x² + 3apq·x + c
  // Need 3a(p+q) even for integer coefficient
  if ((a * (p + q)) % 2 !== 0) {
    // Adjust to make it work
    q = p + 2; // ensure p+q is even
  }

  const c3 = a;
  const c2 = -(3 * a * (p + q)) / 2;
  const c1 = 3 * a * p * q;
  const c0 = Math.floor(rng() * 5) - 2;

  if (!Number.isInteger(c2)) return null;

  const coeffs: Poly = [c0, c1, c2, c3];

  const fp = polyEval(coeffs, p);
  const fq = polyEval(coeffs, q);

  const pStr = p < 0 ? `−${Math.abs(p)}` : `${p}`;
  const qStr = q < 0 ? `−${Math.abs(q)}` : `${q}`;
  const fpStr = fp < 0 ? `−${Math.abs(fp)}` : `${fp}`;
  const fqStr = fq < 0 ? `−${Math.abs(fq)}` : `${fq}`;

  const expr = `f(x) = ${formatPoly(coeffs)} の極値を求めよ`;

  // For a > 0: max at p (smaller root), min at q (larger root)
  const answerExpr = `極大値 ${fpStr}（x = ${pStr}），極小値 ${fqStr}（x = ${qStr}）`;

  return { expr, answerExpr, isNL: true };
};
