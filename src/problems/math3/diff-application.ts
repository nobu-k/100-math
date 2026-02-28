import { mulberry32 } from "../random";
import { type Poly, polyDeriv, polyEval, formatPoly } from "../shared/poly-utils";

export interface DiffApplicationProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateDiffApplication = (
  seed: number,
  count = 10,
): DiffApplicationProblem[] => {
  const rng = mulberry32(seed);
  const problems: DiffApplicationProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = generateOne(rng);
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

const generateOne = (rng: () => number): DiffApplicationProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) return generateIncreaseDecrease(rng);
  if (variant === 1) return generateLocalExtrema(rng);
  return generateVelocity(rng);
};

const generateIncreaseDecrease = (rng: () => number): DiffApplicationProblem | null => {
  // f(x) = ax³ + bx² + cx. Find intervals of increase/decrease
  const a = rng() < 0.5 ? 1 : -1;
  const b = Math.floor(rng() * 5) - 2;
  const c = Math.floor(rng() * 7) - 3;

  // f(x) = ax³ + bx² + cx → Poly = [0, c, b, a]
  const poly: Poly = [0, c, b, a];
  const fp = polyDeriv(poly); // f'(x)

  // f'(x) = 3ax² + 2bx + c
  const fA = 3 * a;
  const fB = 2 * b;
  const fC = c;
  const disc = fB * fB - 4 * fA * fC;

  const fStr = formatPoly(poly);

  if (disc <= 0) {
    // f'(x) ≥ 0 or ≤ 0 always → monotonic
    const dir = a > 0 ? "単調増加" : "単調減少";
    const expr = `f(x) = ${fStr} の増減`;
    const answerExpr = `f'(x) = ${formatPoly(fp)}，判別式 < 0 → ${dir}`;
    return { expr, answerExpr, isNL: true };
  }

  const x1 = (-fB - Math.sqrt(disc)) / (2 * fA);
  const x2 = (-fB + Math.sqrt(disc)) / (2 * fA);
  if (!Number.isInteger(x1) || !Number.isInteger(x2)) return null;

  const lo = Math.min(x1, x2);
  const hi = Math.max(x1, x2);

  const incDec = a > 0
    ? `x < ${fmt(lo)}, x > ${fmt(hi)} で増加，${fmt(lo)} < x < ${fmt(hi)} で減少`
    : `${fmt(lo)} < x < ${fmt(hi)} で増加，x < ${fmt(lo)}, x > ${fmt(hi)} で減少`;

  const expr = `f(x) = ${fStr} の増減`;
  const answerExpr = `f'(x) = ${formatPoly(fp)}，${incDec}`;
  return { expr, answerExpr, isNL: true };
};

const generateLocalExtrema = (rng: () => number): DiffApplicationProblem | null => {
  // f(x) = x³ − px with integer critical points
  // f'(x) = 3x² − p = 0 → x = ±√(p/3)
  // Use p = 3k² so x = ±k
  const k = Math.floor(rng() * 3) + 1;
  const p = 3 * k * k;

  // f(x) = x³ − px → Poly = [0, -p, 0, 1]
  const poly: Poly = [0, -p, 0, 1];
  const fp = polyDeriv(poly);

  const fk = polyEval(poly, k);
  const fnk = polyEval(poly, -k);

  const expr = `f(x) = ${formatPoly(poly)} の極値`;
  const answerExpr = `f'(x) = ${formatPoly(fp)} = 0 → x = ${fmt(-k)}, ${fmt(k)}，f(${fmt(-k)}) = ${fmt(fnk)}（極大），f(${fmt(k)}) = ${fmt(fk)}（極小）`;
  return { expr, answerExpr, isNL: true };
};

const generateVelocity = (rng: () => number): DiffApplicationProblem | null => {
  // x(t) = at³ + bt² + ct → v(t₀), a(t₀)
  const a = rng() < 0.5 ? 1 : -1;
  const b = Math.floor(rng() * 5) - 2;
  const c = Math.floor(rng() * 7) + 1;
  const t0 = Math.floor(rng() * 3) + 1;

  const pos: Poly = [0, c, b, a];
  const vel = polyDeriv(pos);
  const acc = polyDeriv(vel);

  const v0 = polyEval(vel, t0);
  const a0 = polyEval(acc, t0);

  const expr = `x(t) = ${formatPoly(pos, "t")} のとき，t = ${t0} の速度 v と加速度 a`;
  const answerExpr = `v(${t0}) = ${fmt(v0)}, a(${t0}) = ${fmt(a0)}`;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;
