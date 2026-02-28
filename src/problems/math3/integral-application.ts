import { mulberry32 } from "../random";
import { type Poly, polySub, polyEval, polyInteg, formatPoly } from "../shared/poly-utils";

export type IntegralApplicationMode = "area" | "volume" | "mixed";

export interface IntegralApplicationProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateIntegralApplication = (
  seed: number,
  mode: IntegralApplicationMode = "mixed",
  count = 10,
): IntegralApplicationProblem[] => {
  const rng = mulberry32(seed);
  const problems: IntegralApplicationProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: IntegralApplicationProblem | null = null;
      if (pick === "area") result = generateArea(rng);
      else result = generateVolume(rng);

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

const pickMode = (rng: () => number, mode: IntegralApplicationMode): "area" | "volume" => {
  if (mode !== "mixed") return mode;
  return rng() < 0.6 ? "area" : "volume";
};

const generateArea = (rng: () => number): IntegralApplicationProblem | null => {
  // Area between y = f(x) and y = g(x) from a to b
  // Use simple polynomials: f(x)=x², g(x)=kx → intersect at 0 and k
  const k = Math.floor(rng() * 4) + 1;
  // f(x) = kx, g(x) = x² → f - g = kx - x² = -(x² - kx) = -(x)(x-k)
  // Area = ∫₀ᵏ (kx - x²) dx
  const F: Poly = [0, k]; // kx
  const G: Poly = [0, 0, 1]; // x²
  const diff = polySub(F, G); // kx - x²
  const integ = polyInteg(diff);

  const area = polyEval(integ, k) - polyEval(integ, 0);
  if (area <= 0) return null;

  const areaStr = formatFrac(area);

  const expr = `y = ${formatPoly(F)} と y = ${formatPoly(G)} で囲まれた面積`;
  const answerExpr = `∫₀${superscript(k)} (${formatPoly(diff)}) dx = ${areaStr}`;
  return { expr, answerExpr, isNL: true };
};

const generateVolume = (rng: () => number): IntegralApplicationProblem | null => {
  // Volume of revolution: V = π∫₀ᵃ f(x)² dx
  // Use f(x) = x (cone): V = π∫₀ᵃ x² dx = πa³/3
  const a = Math.floor(rng() * 4) + 1;
  const v = a * a * a;

  const expr = `y = x (0 ≤ x ≤ ${a}) を x 軸まわりに回転した体積`;
  const answerExpr = `V = π∫₀${superscript(a)} x² dx = π·${a}³/3 = ${v}/3·π`;
  return { expr, answerExpr, isNL: true };
};

const formatFrac = (n: number): string => {
  if (Number.isInteger(n)) return `${n}`;
  // Try common denominators
  for (const d of [2, 3, 4, 6, 8, 12]) {
    const num = n * d;
    if (Math.abs(num - Math.round(num)) < 1e-9) {
      const rn = Math.round(num);
      const g = gcd(Math.abs(rn), d);
      return `${rn / g}/${d / g}`;
    }
  }
  return `${Math.round(n * 100) / 100}`;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};

const superscript = (n: number): string => {
  if (n === 1) return "¹";
  if (n === 2) return "²";
  if (n === 3) return "³";
  if (n === 4) return "⁴";
  return `^${n}`;
};
