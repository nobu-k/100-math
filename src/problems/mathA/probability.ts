import { mulberry32 } from "../random";
import { nCr } from "../shared/latex-format";
import { gcd } from "../shared/math-utils";

export type ProbabilityMode = "basic" | "complement" | "conditional" | "expected-value" | "mixed";

export interface ProbabilityProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateProbability = (
  seed: number,
  mode: ProbabilityMode = "mixed",
  count = 8,
): ProbabilityProblem[] => {
  const rng = mulberry32(seed);
  const problems: ProbabilityProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: ProbabilityProblem | null = null;
      if (pick === "basic") result = generateBasic(rng);
      else if (pick === "complement") result = generateComplement(rng);
      else if (pick === "conditional") result = generateConditional(rng);
      else result = generateExpectedValue(rng);

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

const pickMode = (rng: () => number, mode: ProbabilityMode): "basic" | "complement" | "conditional" | "expected-value" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.3) return "basic";
  if (r < 0.55) return "complement";
  if (r < 0.8) return "conditional";
  return "expected-value";
};

const generateBasic = (rng: () => number): ProbabilityProblem | null => {
  // Draw balls from a bag
  const red = Math.floor(rng() * 4) + 2;   // [2..5]
  const blue = Math.floor(rng() * 4) + 2;  // [2..5]
  const total = red + blue;
  const draw = 2;

  const num = nCr(red, draw);
  const den = nCr(total, draw);
  if (den === 0) return null;

  const g = gcd(num, den);
  const expr = `袋の中に赤玉 ${red} 個，青玉 ${blue} 個がある。${draw} 個同時に取り出すとき，${draw} 個とも赤玉である確率`;
  const answerExpr = `${red}C${draw}/${total}C${draw} = ${num / g}/${den / g}`;

  return { expr, answerExpr, isNL: true };
};

const generateComplement = (rng: () => number): ProbabilityProblem | null => {
  // P(at least 1 red) = 1 - P(none red)
  const red = Math.floor(rng() * 3) + 2;   // [2..4]
  const blue = Math.floor(rng() * 4) + 3;  // [3..6]
  const total = red + blue;
  const draw = 2;

  const noneRed = nCr(blue, draw);
  const allWays = nCr(total, draw);
  if (allWays === 0) return null;

  const num = allWays - noneRed;
  const g = gcd(num, allWays);

  const expr = `袋の中に赤玉 ${red} 個，青玉 ${blue} 個がある。${draw} 個同時に取り出すとき，少なくとも 1 個は赤玉である確率`;
  const answerExpr = `1 − ${noneRed / gcd(noneRed, allWays)}/${allWays / gcd(noneRed, allWays)} = ${num / g}/${allWays / g}`;

  return { expr, answerExpr, isNL: true };
};

const generateConditional = (rng: () => number): ProbabilityProblem | null => {
  // Simple conditional: two dice
  const targetSum = Math.floor(rng() * 5) + 5; // [5..9]
  // P(sum=target | first die = k) for some k
  const firstDie = Math.floor(rng() * 6) + 1; // [1..6]
  const need = targetSum - firstDie;

  let favorable = 0;
  if (need >= 1 && need <= 6) favorable = 1;

  const expr = `2 つのさいころを投げるとき，1 つ目が ${firstDie} であるとき，合計が ${targetSum} になる確率`;
  const answerExpr = favorable === 0 ? "0" : "1/6";

  return { expr, answerExpr, isNL: true };
};

const generateExpectedValue = (rng: () => number): ProbabilityProblem | null => {
  // Coin toss game: X = number of heads in n tosses
  const n = Math.floor(rng() * 3) + 2; // [2..4]
  const reward = Math.floor(rng() * 4) + 1; // [1..4] * 100 yen per head

  const eX = n * 0.5;
  const expected = eX * reward * 100;

  const expr = `コインを ${n} 回投げ，表が出た回数 × ${reward * 100} 円もらえるとき，もらえる金額の期待値`;
  const answerExpr = `E(X) = ${n} × 1/2 × ${reward * 100} = ${expected} 円`;

  return { expr, answerExpr, isNL: true };
};
