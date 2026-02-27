import { mulberry32 } from "../random";

export type ExponentMode = "simplify" | "nth-root" | "mixed";

export interface ExponentProblem {
  expr: string;
  answerExpr: string;
}

export const generateExponent = (
  seed: number,
  mode: ExponentMode = "mixed",
  count = 12,
): ExponentProblem[] => {
  const rng = mulberry32(seed);
  const problems: ExponentProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = mode === "mixed"
        ? rng() < 0.6 ? "simplify" : "nth-root"
        : mode;

      const result = pick === "simplify"
        ? generateSimplify(rng)
        : generateNthRoot(rng);

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

const generateSimplify = (rng: () => number): ExponentProblem | null => {
  const variant = Math.floor(rng() * 4);

  if (variant === 0) {
    // a^(p/q) where a = b^q for integer result
    const base = Math.floor(rng() * 3) + 2; // [2..4]
    const q = Math.floor(rng() * 2) + 2; // [2..3]
    const p = Math.floor(rng() * 3) + 1; // [1..3]
    const a = Math.pow(base, q);
    const answer = Math.pow(base, p);
    const expr = `${a}^(${p}/${q})`;
    const answerExpr = `${answer}`;
    return { expr, answerExpr };
  }

  if (variant === 1) {
    // a^(-p/q) = 1/a^(p/q)
    const base = Math.floor(rng() * 3) + 2;
    const q = Math.floor(rng() * 2) + 2;
    const a = Math.pow(base, q);
    const answer = base;
    const expr = `${a}^(−1/${q})`;
    const answerExpr = `1/${answer}`;
    return { expr, answerExpr };
  }

  if (variant === 2) {
    // a^p · a^q = a^(p+q)
    const a = Math.floor(rng() * 4) + 2; // [2..5]
    const p = Math.floor(rng() * 4) + 1; // [1..4]
    const q = Math.floor(rng() * 4) + 1; // [1..4]
    const expr = `${a}${superscript(p)} × ${a}${superscript(q)}`;
    const answerExpr = `${a}${superscript(p + q)}`;
    return { expr, answerExpr };
  }

  // (a^p)^q = a^(pq)
  const a = Math.floor(rng() * 4) + 2;
  const p = Math.floor(rng() * 3) + 1; // [1..3]
  const q = Math.floor(rng() * 3) + 1;
  const expr = `(${a}${superscript(p)})${superscript(q)}`;
  const answerExpr = `${a}${superscript(p * q)}`;
  return { expr, answerExpr };
};

const generateNthRoot = (rng: () => number): ExponentProblem | null => {
  // ⁿ√a where a = b^n
  const n = Math.floor(rng() * 3) + 2; // [2..4]
  const b = Math.floor(rng() * 4) + 2; // [2..5]
  const a = Math.pow(b, n);

  const rootSym = n === 2 ? "√" : n === 3 ? "³√" : `${n}√`;
  const expr = `${rootSym}${a}`;
  const answerExpr = `${b}`;

  return { expr, answerExpr };
};

const superscript = (n: number): string => {
  const sup: Record<number, string> = { 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸" };
  return sup[n] ?? `^${n}`;
};
