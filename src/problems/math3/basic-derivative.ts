import { mulberry32 } from "../random";

export type FuncType = "polynomial" | "trig" | "exponential" | "logarithmic" | "mixed";

export interface DiffProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateBasicDerivative = (
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

type TaggedFunc = [string, string, Exclude<FuncType, "mixed" | "polynomial">];

const FUNCS: TaggedFunc[] = [
  ["sin x", "cos x", "trig"],
  ["cos x", "−sin x", "trig"],
  ["tan x", "1/cos²x", "trig"],
  ["eˣ", "eˣ", "exponential"],
  ["ln x", "1/x", "logarithmic"],
];

const generateOne = (rng: () => number, funcType: FuncType): DiffProblem | null => {
  if (funcType === "mixed" || funcType === "polynomial") return generateMixed(rng);

  const funcs = FUNCS.filter(([, , t]) => t === funcType);
  if (funcs.length === 0) return null;

  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    const [f, fp] = funcs[Math.floor(rng() * funcs.length)];
    return { expr: `${f} を微分せよ`, answerExpr: fp, isNL: true };
  }

  if (variant === 1) {
    const a = Math.floor(rng() * 4) + 2;
    const [f, fp] = funcs[Math.floor(rng() * funcs.length)];
    const answerExpr = `${a}${fp.startsWith("−") ? `(${fp})` : fp}`;
    return { expr: `${a}${f} を微分せよ`, answerExpr, isNL: true };
  }

  if (funcs.length >= 2) {
    const idx1 = Math.floor(rng() * funcs.length);
    let idx2 = Math.floor(rng() * funcs.length);
    if (idx2 === idx1) idx2 = (idx1 + 1) % funcs.length;
    const [f1, fp1] = funcs[idx1];
    const [f2, fp2] = funcs[idx2];
    const isPlus = rng() < 0.5;
    const op = isPlus ? "+" : "−";
    return { expr: `${f1} ${op} ${f2} を微分せよ`, answerExpr: `${fp1} ${op} ${fp2}`, isNL: true };
  }

  // Only 1 func in category — fall back to coefficient variant
  const a = Math.floor(rng() * 4) + 2;
  const [f, fp] = funcs[0];
  return { expr: `${a}${f} を微分せよ`, answerExpr: `${a}${fp.startsWith("−") ? `(${fp})` : fp}`, isNL: true };
};

const generateMixed = (rng: () => number): DiffProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    const [f, fp] = FUNCS[Math.floor(rng() * FUNCS.length)];
    return { expr: `${f} を微分せよ`, answerExpr: fp, isNL: true };
  }

  if (variant === 1) {
    const a = Math.floor(rng() * 4) + 2;
    const [f, fp] = FUNCS[Math.floor(rng() * FUNCS.length)];
    const answerExpr = `${a}${fp.startsWith("−") ? `(${fp})` : fp}`;
    return { expr: `${a}${f} を微分せよ`, answerExpr, isNL: true };
  }

  const idx1 = Math.floor(rng() * FUNCS.length);
  let idx2 = Math.floor(rng() * FUNCS.length);
  if (idx2 === idx1) idx2 = (idx1 + 1) % FUNCS.length;
  const [f1, fp1] = FUNCS[idx1];
  const [f2, fp2] = FUNCS[idx2];
  const isPlus = rng() < 0.5;
  const op = isPlus ? "+" : "−";
  return { expr: `${f1} ${op} ${f2} を微分せよ`, answerExpr: `${fp1} ${op} ${fp2}`, isNL: true };
};
