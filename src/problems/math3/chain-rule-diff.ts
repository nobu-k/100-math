import { mulberry32 } from "../random";

export type FuncType = "polynomial" | "trig" | "exponential" | "logarithmic" | "mixed";

export interface DiffProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateChainRuleDiff = (
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
  if (funcType === "mixed") {
    const variant = Math.floor(rng() * 4);
    if (variant === 0) return genPowerChain(rng);
    if (variant === 1) return genSinChain(rng);
    if (variant === 2) return genExpChain(rng);
    return genLnChain(rng);
  }
  if (funcType === "polynomial") return genPowerChain(rng);
  if (funcType === "trig") return genSinChain(rng);
  if (funcType === "exponential") return genExpChain(rng);
  return genLnChain(rng);
};

const genPowerChain = (rng: () => number): DiffProblem => {
  const a = Math.floor(rng() * 4) + 1;
  const b = Math.floor(rng() * 7) - 3;
  const n = Math.floor(rng() * 4) + 2;
  const inner = a === 1 ? `x ${signConst(b)}` : `${a}x ${signConst(b)}`;
  const coeff = n * a;
  const expr = `(${inner})${sup(n)} を微分せよ`;
  const answerExpr = `${coeff}(${inner})${sup(n - 1)}`;
  return { expr, answerExpr, isNL: true };
};

const genSinChain = (rng: () => number): DiffProblem => {
  const a = Math.floor(rng() * 3) + 1;
  const b = Math.floor(rng() * 5) - 2;
  const inner = a === 1 ? `x ${signConst(b)}` : `${a}x ${signConst(b)}`;
  const expr = `sin(${inner}) を微分せよ`;
  const coeff = a === 1 ? "" : `${a}`;
  const answerExpr = `${coeff}cos(${inner})`;
  return { expr, answerExpr, isNL: true };
};

const genExpChain = (rng: () => number): DiffProblem => {
  const a = Math.floor(rng() * 3) + 1;
  const b = Math.floor(rng() * 5) - 2;
  const inner = a === 1 ? `x ${signConst(b)}` : `${a}x ${signConst(b)}`;
  const expr = `e^(${inner}) を微分せよ`;
  const coeff = a === 1 ? "" : `${a}`;
  const answerExpr = `${coeff}e^(${inner})`;
  return { expr, answerExpr, isNL: true };
};

const genLnChain = (rng: () => number): DiffProblem => {
  const a = Math.floor(rng() * 3) + 1;
  const b = Math.floor(rng() * 5) + 1;
  const inner = a === 1 ? `x + ${b}` : `${a}x + ${b}`;
  const expr = `ln(${inner}) を微分せよ`;
  const answerExpr = `${a}/(${inner})`;
  return { expr, answerExpr, isNL: true };
};

const sup = (n: number): string => {
  const s: Record<number, string> = { 1: "", 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
  return s[n] ?? `^${n}`;
};

const signConst = (c: number): string => {
  if (c === 0) return "";
  return c > 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
};
