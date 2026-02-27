import { mulberry32 } from "../random";

export type FuncType = "polynomial" | "trig" | "exponential" | "logarithmic" | "mixed";

export interface IntegralProblem {
  expr: string;
  answerExpr: string;
}

export const generateBasicIntegral = (
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

type TaggedFunc = [string, string, Exclude<FuncType, "mixed" | "polynomial">];

const FUNCS: TaggedFunc[] = [
  ["sin x", "−cos x + C", "trig"],
  ["cos x", "sin x + C", "trig"],
  ["eˣ", "eˣ + C", "exponential"],
  ["1/x", "ln|x| + C", "logarithmic"],
];

const generateOne = (rng: () => number, funcType: FuncType): IntegralProblem | null => {
  if (funcType === "mixed") return generateMixed(rng);
  if (funcType === "polynomial") return generatePoly(rng);

  const funcs = FUNCS.filter(([, , t]) => t === funcType);
  if (funcs.length === 0) return null;

  if (rng() < 0.5) {
    const [f, F] = funcs[Math.floor(rng() * funcs.length)];
    return { expr: `∫ ${f} dx`, answerExpr: F };
  }
  const a = Math.floor(rng() * 4) + 2;
  const [f, F] = funcs[Math.floor(rng() * funcs.length)];
  const ansF = F.replace(" + C", "");
  return { expr: `∫ ${a}${f} dx`, answerExpr: `${a}(${ansF}) + C` };
};

const generateMixed = (rng: () => number): IntegralProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    const [f, F] = FUNCS[Math.floor(rng() * FUNCS.length)];
    return { expr: `∫ ${f} dx`, answerExpr: F };
  }

  if (variant === 1) {
    const a = Math.floor(rng() * 4) + 2;
    const [f, F] = FUNCS[Math.floor(rng() * FUNCS.length)];
    const ansF = F.replace(" + C", "");
    return { expr: `∫ ${a}${f} dx`, answerExpr: `${a}(${ansF}) + C` };
  }

  return generatePoly(rng);
};

const generatePoly = (rng: () => number): IntegralProblem => {
  const nChoices = [-2, -0.5, 0.5, 1.5];
  const n = nChoices[Math.floor(rng() * nChoices.length)];

  if (n === -0.5) return { expr: "∫ 1/√x dx", answerExpr: "2√x + C" };
  if (n === 0.5) return { expr: "∫ √x dx", answerExpr: "(2/3)x√x + C" };
  if (n === -2) return { expr: "∫ 1/x² dx", answerExpr: "−1/x + C" };
  return { expr: "∫ x√x dx", answerExpr: "(2/5)x²√x + C" };
};
