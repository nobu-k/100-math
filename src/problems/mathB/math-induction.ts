import { mulberry32 } from "../random";

export interface MathInductionProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateMathInduction = (
  seed: number,
  count = 10,
): MathInductionProblem[] => {
  const rng = mulberry32(seed);
  const problems: MathInductionProblem[] = [];
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

const generateOne = (rng: () => number): MathInductionProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) return generateBaseCase(rng);
  if (variant === 1) return generateInductiveStep(rng);
  return generateDivisibility(rng);
};

const generateBaseCase = (rng: () => number): MathInductionProblem | null => {
  // Sum formula: 1+2+...+n = n(n+1)/2
  // Base case n=1: LHS=1, RHS=1·2/2=1
  const templates: [string, string, string][] = [
    [
      "1 + 2 + … + n = n(n+1)/2",
      "n = 1 のとき，左辺 = 1，右辺 = 1·2/2 = 1",
      "左辺 = 右辺 = 1 で成立",
    ],
    [
      "1² + 2² + … + n² = n(n+1)(2n+1)/6",
      "n = 1 のとき，左辺 = 1，右辺 = 1·2·3/6 = 1",
      "左辺 = 右辺 = 1 で成立",
    ],
    [
      "1³ + 2³ + … + n³ = {n(n+1)/2}²",
      "n = 1 のとき，左辺 = 1，右辺 = (1·2/2)² = 1",
      "左辺 = 右辺 = 1 で成立",
    ],
    [
      "1 + 3 + 5 + … + (2n−1) = n²",
      "n = 1 のとき，左辺 = 1，右辺 = 1² = 1",
      "左辺 = 右辺 = 1 で成立",
    ],
  ];

  const [formula, , answer] = templates[Math.floor(rng() * templates.length)];
  const expr = `${formula} の基本ステップ：n = 1 のとき成立を確認せよ`;
  return { expr, answerExpr: answer, isNL: true };
};

const generateInductiveStep = (rng: () => number): MathInductionProblem | null => {
  // n=k+1 step: 1+2+...+n = n(n+1)/2, add (k+1)
  // Consume rng values to maintain PRNG sequence
  rng(); rng();
  const k = Math.floor(rng() * 6) + 3;
  const sumK = k * (k + 1) / 2;
  const sumK1 = (k + 1) * (k + 2) / 2;

  const expr = `1+2+…+n = n(n+1)/2 で n = ${k} を仮定。n = ${k + 1} の左辺`;
  const answerExpr = `${fmt(sumK)} + ${k + 1} = ${fmt(sumK1)} = ${k + 1}·${k + 2}/2`;
  return { expr, answerExpr, isNL: true };
};

const generateDivisibility = (rng: () => number): MathInductionProblem | null => {
  // bⁿ − 1 is divisible by (b−1)
  const bases: [number, number][] = [
    [3, 2], // 3ⁿ−1 is divisible by 2
    [5, 4], // 5ⁿ−1 is divisible by 4
    [4, 3], // 4ⁿ−1 is divisible by 3
    [7, 6], // 7ⁿ−1 is divisible by 6
  ];

  const [base, div] = bases[Math.floor(rng() * bases.length)];
  const n = Math.floor(rng() * 3) + 1;
  const val = Math.pow(base, n) - 1;

  const expr = `${base}ⁿ − 1 は ${div} の倍数。n = ${n} のとき確認せよ`;
  const answerExpr = `${base}${superscript(n)} − 1 = ${val}，${val} ÷ ${div} = ${val / div}`;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const superscript = (n: number): string => {
  if (n === 1) return "¹";
  if (n === 2) return "²";
  if (n === 3) return "³";
  return `^${n}`;
};
