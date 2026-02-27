import { mulberry32 } from "../random";
import { nPr, nCr, factorial } from "../shared/latex-format";

export type PermCombMode = "permutation" | "combination" | "mixed";

export interface PermCombProblem {
  expr: string;
  answerExpr: string;
}

export const generatePermComb = (
  seed: number,
  mode: PermCombMode = "mixed",
  count = 12,
): PermCombProblem[] => {
  const rng = mulberry32(seed);
  const problems: PermCombProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = mode === "mixed"
        ? rng() < 0.5 ? "permutation" : "combination"
        : mode;

      const result = pick === "permutation"
        ? generatePermutation(rng)
        : generateCombination(rng);

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

const generatePermutation = (rng: () => number): PermCombProblem | null => {
  const variant = rng();

  if (variant < 0.5) {
    // nPr
    const n = Math.floor(rng() * 6) + 3; // [3..8]
    const r = Math.floor(rng() * Math.min(n, 4)) + 1; // [1..min(n,4)]
    const answer = nPr(n, r);
    return { expr: `${n}P${r}`, answerExpr: `${answer}` };
  }
  if (variant < 0.75) {
    // Circular permutation: (n-1)!
    const n = Math.floor(rng() * 4) + 3; // [3..6]
    const answer = factorial(n - 1);
    return {
      expr: `${n} 人を円形に並べる方法の数`,
      answerExpr: `(${n} − 1)! = ${answer} 通り`,
    };
  }
  // Permutations with repetition: n^r
  const n = Math.floor(rng() * 4) + 2; // [2..5]
  const r = Math.floor(rng() * 3) + 2; // [2..4]
  const answer = Math.pow(n, r);
  return {
    expr: `${n} 種類から重複を許して ${r} 個選んで並べる方法の数`,
    answerExpr: `${n}${superscript(r)} = ${answer} 通り`,
  };
};

const generateCombination = (rng: () => number): PermCombProblem | null => {
  const variant = rng();

  if (variant < 0.6) {
    // nCr
    const n = Math.floor(rng() * 7) + 3; // [3..9]
    const r = Math.floor(rng() * Math.min(n - 1, 4)) + 1; // [1..min(n-1,4)]
    const answer = nCr(n, r);
    return { expr: `${n}C${r}`, answerExpr: `${answer}` };
  }
  // With constraint: must include a specific item → (n-1)C(r-1)
  const n = Math.floor(rng() * 5) + 5; // [5..9]
  const r = Math.floor(rng() * 3) + 2; // [2..4]
  const answer = nCr(n - 1, r - 1);
  return {
    expr: `${n} 人から ${r} 人を選ぶ。特定の 1 人を必ず含む選び方の数`,
    answerExpr: `${n - 1}C${r - 1} = ${answer} 通り`,
  };
};

const superscript = (n: number): string => {
  if (n === 2) return "²";
  if (n === 3) return "³";
  if (n === 4) return "⁴";
  return `^${n}`;
};
