import { mulberry32 } from "../random";

export interface SeqProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateSigmaSum = (
  seed: number,
  count = 10,
): SeqProblem[] => {
  const rng = mulberry32(seed);
  const problems: SeqProblem[] = [];
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

const generateOne = (rng: () => number): SeqProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    const n = Math.floor(rng() * 15) + 5;
    const answer = n * (n + 1) / 2;
    const expr = `Σ[k=1→${n}] k`;
    const answerExpr = `${n}(${n} + 1)/2 = ${answer}`;
    return { expr, answerExpr };
  }

  if (variant === 1) {
    const n = Math.floor(rng() * 8) + 3;
    const answer = n * (n + 1) * (2 * n + 1) / 6;
    const expr = `Σ[k=1→${n}] k²`;
    const answerExpr = `${n}(${n} + 1)(${2 * n + 1})/6 = ${answer}`;
    return { expr, answerExpr };
  }

  const a = Math.floor(rng() * 5) + 1;
  const b = Math.floor(rng() * 9) - 4;
  const n = Math.floor(rng() * 8) + 3;
  const answer = a * n * (n + 1) / 2 + b * n;

  const bStr = b === 0 ? "" : (b > 0 ? ` + ${b}` : ` − ${Math.abs(b)}`);
  const expr = `Σ[k=1→${n}] (${a}k${bStr})`;
  const answerExpr = `${answer}`;
  return { expr, answerExpr };
};
