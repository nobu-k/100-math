import { mulberry32 } from "../random";

export type FuncType = "polynomial" | "trig" | "exponential" | "logarithmic" | "mixed";

export interface DiffProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateProductQuotientDiff = (
  seed: number,
  funcType: FuncType = "mixed",
  count = 10,
): DiffProblem[] => {
  const rng = mulberry32(seed);
  const problems: DiffProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = generateOne(rng, funcType);
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

const generateOne = (rng: () => number, funcType: FuncType): DiffProblem | null => {
  if (funcType === "mixed" || funcType === "polynomial") return generateMixed(rng);
  if (funcType === "exponential") {
    return rng() < 0.6 ? genXnEx(rng) : genExOverX();
  }
  if (funcType === "trig") {
    return rng() < 0.6 ? genXSinX() : genSinXOverX();
  }
  // logarithmic
  return genXLnX();
};

const generateMixed = (rng: () => number): DiffProblem | null => {
  if (rng() < 0.5) {
    const variant = Math.floor(rng() * 3);
    if (variant === 0) return genXnEx(rng);
    if (variant === 1) return genXSinX();
    return genXLnX();
  }
  return rng() < 0.5 ? genSinXOverX() : genExOverX();
};

const genXnEx = (rng: () => number): DiffProblem => {
  const n = Math.floor(rng() * 3) + 1;
  const expr = `x${sup(n)} × eˣ を微分せよ`;
  const answerExpr = n === 1 ? "(x + 1)eˣ" : `(x${sup(n)} + ${n}x${sup(n - 1)})eˣ`;
  return { expr, answerExpr, isNL: true };
};

const genXSinX = (): DiffProblem => ({
  expr: "x sin x を微分せよ",
  answerExpr: "sin x + x cos x",
  isNL: true,
});

const genXLnX = (): DiffProblem => ({
  expr: "x ln x を微分せよ",
  answerExpr: "ln x + 1",
  isNL: true,
});

const genSinXOverX = (): DiffProblem => ({
  expr: "sin x / x を微分せよ",
  answerExpr: "(x cos x − sin x)/x²",
  isNL: true,
});

const genExOverX = (): DiffProblem => ({
  expr: "eˣ/x を微分せよ",
  answerExpr: "(x − 1)eˣ/x²",
  isNL: true,
});

const sup = (n: number): string => {
  const s: Record<number, string> = { 1: "", 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
  return s[n] ?? `^${n}`;
};
