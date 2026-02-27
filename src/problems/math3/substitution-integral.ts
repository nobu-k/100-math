import { mulberry32 } from "../random";

export type FuncType = "polynomial" | "trig" | "exponential" | "logarithmic" | "mixed";

export interface IntegralProblem {
  expr: string;
  answerExpr: string;
}

export const generateSubstitutionIntegral = (
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
  const a = Math.floor(rng() * 3) + 2;
  const b = Math.floor(rng() * 5) + 1;

  if (funcType === "mixed") return generateMixed(rng, a, b);
  if (funcType === "trig") return rng() < 0.5 ? genSin(a, b) : genCos(a, b);
  if (funcType === "exponential") return genExp(a, b);
  if (funcType === "logarithmic") return genLog(a, b);
  const n = Math.floor(rng() * 3) + 2;
  return genPower(a, b, n);
};

const generateMixed = (rng: () => number, a: number, b: number): IntegralProblem => {
  const variant = Math.floor(rng() * 4);
  if (variant === 0) return genSin(a, b);
  if (variant === 1) return genCos(a, b);
  if (variant === 2) return genExp(a, b);
  const n = Math.floor(rng() * 3) + 2;
  return genPower(a, b, n);
};

const genSin = (a: number, b: number): IntegralProblem => ({
  expr: `∫ sin(${a}x + ${b}) dx`,
  answerExpr: `−(1/${a})cos(${a}x + ${b}) + C`,
});

const genCos = (a: number, b: number): IntegralProblem => ({
  expr: `∫ cos(${a}x + ${b}) dx`,
  answerExpr: `(1/${a})sin(${a}x + ${b}) + C`,
});

const genExp = (a: number, b: number): IntegralProblem => ({
  expr: `∫ e^(${a}x + ${b}) dx`,
  answerExpr: `(1/${a})e^(${a}x + ${b}) + C`,
});

const genLog = (a: number, b: number): IntegralProblem => ({
  expr: `∫ 1/(${a}x + ${b}) dx`,
  answerExpr: `(1/${a})ln|${a}x + ${b}| + C`,
});

const genPower = (a: number, b: number, n: number): IntegralProblem => ({
  expr: `∫ (${a}x + ${b})${sup(n)} dx`,
  answerExpr: `(1/${a * (n + 1)})(${a}x + ${b})${sup(n + 1)} + C`,
});

const sup = (n: number): string => {
  const s: Record<number, string> = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
  return s[n] ?? `^${n}`;
};
