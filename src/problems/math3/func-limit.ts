import { mulberry32 } from "../random";

export interface FuncLimitProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateFuncLimit = (
  seed: number,
  count = 10,
): FuncLimitProblem[] => {
  const rng = mulberry32(seed);
  const problems: FuncLimitProblem[] = [];
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

const generateOne = (rng: () => number): FuncLimitProblem | null => {
  const variant = Math.floor(rng() * 4);

  if (variant === 0) return generateRational(rng);
  if (variant === 1) return generateInfinity(rng);
  if (variant === 2) return generateSinLimit(rng);
  return generateExpLimit(rng);
};

const generateRational = (rng: () => number): FuncLimitProblem | null => {
  // lim(x→a) (x² − a²)/(x − a) = 2a
  const a = Math.floor(rng() * 7) - 3;
  if (a === 0) return null;
  const result = 2 * a;

  const a2 = a * a;
  const xMinusA = a > 0 ? `x − ${a}` : `x + ${-a}`;
  const expr = `lim(x→${fmt(a)}) (x² − ${a2})/(${xMinusA})`;
  const answerExpr = `${fmt(result)}`;
  return { expr, answerExpr, isNL: true };
};

const generateInfinity = (rng: () => number): FuncLimitProblem | null => {
  // lim(x→∞) (ax² + bx + c)/(dx² + ex + f)  = a/d
  const a = Math.floor(rng() * 5) + 1;
  const b = Math.floor(rng() * 7) - 3;
  const d = Math.floor(rng() * 5) + 1;
  const e = Math.floor(rng() * 7) - 3;

  const numStr = b === 0 ? `${a}x²` : `${a}x² ${b > 0 ? `+ ${b}x` : `− ${-b}x`}`;
  const denStr = e === 0 ? `${d}x²` : `${d}x² ${e > 0 ? `+ ${e}x` : `− ${-e}x`}`;

  const g = gcd(a, d);
  const rn = a / g;
  const rd = d / g;
  const ansStr = rd === 1 ? `${rn}` : `${rn}/${rd}`;

  const expr = `lim(x→∞) (${numStr})/(${denStr})`;
  const answerExpr = ansStr;
  return { expr, answerExpr, isNL: true };
};

const generateSinLimit = (rng: () => number): FuncLimitProblem | null => {
  // lim(x→0) sin(ax)/(bx) = a/b
  const a = Math.floor(rng() * 5) + 1;
  const b = Math.floor(rng() * 5) + 1;

  const g = gcd(a, b);
  const rn = a / g;
  const rd = b / g;
  const ansStr = rd === 1 ? `${rn}` : `${rn}/${rd}`;

  const sinArg = a === 1 ? "x" : `${a}x`;
  const denArg = b === 1 ? "x" : `${b}x`;

  const expr = `lim(x→0) sin(${sinArg})/(${denArg})`;
  const answerExpr = ansStr;
  return { expr, answerExpr, isNL: true };
};

const generateExpLimit = (rng: () => number): FuncLimitProblem | null => {
  // lim(x→0) (eᵃˣ − 1)/(bx) = a/b
  const a = Math.floor(rng() * 4) + 1;
  const b = Math.floor(rng() * 4) + 1;

  const g = gcd(a, b);
  const rn = a / g;
  const rd = b / g;
  const ansStr = rd === 1 ? `${rn}` : `${rn}/${rd}`;

  const expArg = a === 1 ? "x" : `${a}x`;
  const denArg = b === 1 ? "x" : `${b}x`;

  const expr = `lim(x→0) (e^(${expArg}) − 1)/(${denArg})`;
  const answerExpr = ansStr;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
