import { mulberry32 } from "../random";

export type FuncType = "polynomial" | "trig" | "exponential" | "logarithmic" | "mixed";

export interface IntegralProblem {
  expr: string;
  answerExpr: string;
}

export const generateByPartsIntegral = (
  seed: number,
  funcType: FuncType = "mixed",
  count = 10,
): IntegralProblem[] => {
  const rng = mulberry32(seed);
  const problems: IntegralProblem[] = [];
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

const generateOne = (rng: () => number, funcType: FuncType): IntegralProblem | null => {
  if (funcType === "mixed" || funcType === "polynomial") {
    const variant = Math.floor(rng() * 3);
    if (variant === 0) return generateXeX(rng);
    if (variant === 1) return { expr: "∫ x sin x dx", answerExpr: "−x cos x + sin x + C" };
    return { expr: "∫ ln x dx", answerExpr: "x ln x − x + C" };
  }
  if (funcType === "exponential") return generateXeX(rng);
  if (funcType === "trig") {
    if (rng() < 0.5) return { expr: "∫ x sin x dx", answerExpr: "−x cos x + sin x + C" };
    return { expr: "∫ x cos x dx", answerExpr: "x sin x + cos x + C" };
  }
  // logarithmic
  if (rng() < 0.5) return { expr: "∫ ln x dx", answerExpr: "x ln x − x + C" };
  return { expr: "∫ x ln x dx", answerExpr: "(x²/2) ln x − x²/4 + C" };
};

const generateXeX = (rng: () => number): IntegralProblem => {
  const a = Math.floor(rng() * 3) + 1;
  if (a === 1) return { expr: "∫ xeˣ dx", answerExpr: "(x − 1)eˣ + C" };
  return { expr: `∫ ${a}xeˣ dx`, answerExpr: `${a}(x − 1)eˣ + C` };
};
