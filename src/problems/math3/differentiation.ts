import { mulberry32 } from "../random";

export type DifferentiationMode = "product-quotient" | "chain" | "trig-exp-log" | "mixed";

export interface DifferentiationProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateDifferentiation = (
  seed: number,
  mode: DifferentiationMode = "mixed",
  count = 10,
): DifferentiationProblem[] => {
  const rng = mulberry32(seed);
  const problems: DifferentiationProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: DifferentiationProblem | null = null;
      if (pick === "product-quotient") result = generateProductQuotient(rng);
      else if (pick === "chain") result = generateChain(rng);
      else result = generateTrigExpLog(rng);

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

const pickMode = (rng: () => number, mode: DifferentiationMode): "product-quotient" | "chain" | "trig-exp-log" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "product-quotient";
  if (r < 0.65) return "chain";
  return "trig-exp-log";
};

const generateProductQuotient = (rng: () => number): DifferentiationProblem | null => {
  if (rng() < 0.5) {
    // Product rule: (fg)' = f'g + fg'
    const variant = Math.floor(rng() * 3);
    if (variant === 0) {
      // x²·eˣ → 2x·eˣ + x²·eˣ = (x² + 2x)eˣ
      const n = Math.floor(rng() * 3) + 1; // [1..3]
      const expr = `x${sup(n)} × eˣ を微分せよ`;
      // Simplify for n=1: (x + 1)eˣ, n=2: (x² + 2x)eˣ, n=3: (x³ + 3x²)eˣ
      const answerExpr = n === 1 ? "(x + 1)eˣ" : `(x${sup(n)} + ${n}x${sup(n - 1)})eˣ`;
      return { expr, answerExpr, isNL: true };
    }
    if (variant === 1) {
      // x·sinx → sinx + x·cosx
      const expr = "x sin x を微分せよ";
      const answerExpr = "sin x + x cos x";
      return { expr, answerExpr, isNL: true };
    }
    // x·lnx → lnx + 1
    const expr = "x ln x を微分せよ";
    const answerExpr = "ln x + 1";
    return { expr, answerExpr, isNL: true };
  }

  // Quotient rule: (f/g)' = (f'g - fg')/g²
  const variant = Math.floor(rng() * 2);
  if (variant === 0) {
    // sinx/x → (x·cosx - sinx)/x²
    const expr = "sin x / x を微分せよ";
    const answerExpr = "(x cos x − sin x)/x²";
    return { expr, answerExpr, isNL: true };
  }
  // eˣ/x → (x·eˣ - eˣ)/x² = (x-1)eˣ/x²
  const expr = "eˣ/x を微分せよ";
  const answerExpr = "(x − 1)eˣ/x²";
  return { expr, answerExpr, isNL: true };
};

const generateChain = (rng: () => number): DifferentiationProblem | null => {
  const variant = Math.floor(rng() * 4);

  if (variant === 0) {
    // (ax + b)^n → n·a·(ax+b)^(n-1)
    const a = Math.floor(rng() * 4) + 1; // [1..4]
    const b = Math.floor(rng() * 7) - 3; // [-3..3]
    const n = Math.floor(rng() * 4) + 2; // [2..5]
    const inner = a === 1 ? `x ${signConst(b)}` : `${a}x ${signConst(b)}`;
    const coeff = n * a;
    const expr = `(${inner})${sup(n)} を微分せよ`;
    const answerExpr = `${coeff}(${inner})${sup(n - 1)}`;
    return { expr, answerExpr, isNL: true };
  }

  if (variant === 1) {
    // sin(ax + b) → a·cos(ax + b)
    const a = Math.floor(rng() * 3) + 1;
    const b = Math.floor(rng() * 5) - 2;
    const inner = a === 1 ? `x ${signConst(b)}` : `${a}x ${signConst(b)}`;
    const expr = `sin(${inner}) を微分せよ`;
    const coeff = a === 1 ? "" : `${a}`;
    const answerExpr = `${coeff}cos(${inner})`;
    return { expr, answerExpr, isNL: true };
  }

  if (variant === 2) {
    // e^(ax+b) → a·e^(ax+b)
    const a = Math.floor(rng() * 3) + 1;
    const b = Math.floor(rng() * 5) - 2;
    const inner = a === 1 ? `x ${signConst(b)}` : `${a}x ${signConst(b)}`;
    const expr = `e^(${inner}) を微分せよ`;
    const coeff = a === 1 ? "" : `${a}`;
    const answerExpr = `${coeff}e^(${inner})`;
    return { expr, answerExpr, isNL: true };
  }

  // ln(ax + b) → a/(ax + b)
  const a = Math.floor(rng() * 3) + 1;
  const b = Math.floor(rng() * 5) + 1; // positive to keep domain valid
  const inner = a === 1 ? `x + ${b}` : `${a}x + ${b}`;
  const expr = `ln(${inner}) を微分せよ`;
  const answerExpr = `${a}/(${inner})`;
  return { expr, answerExpr, isNL: true };
};

const generateTrigExpLog = (rng: () => number): DifferentiationProblem | null => {
  const funcs: [string, string][] = [
    ["sin x", "cos x"],
    ["cos x", "−sin x"],
    ["tan x", "1/cos²x"],
    ["eˣ", "eˣ"],
    ["ln x", "1/x"],
  ];

  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // Basic derivative
    const [f, fp] = funcs[Math.floor(rng() * funcs.length)];
    const expr = `${f} を微分せよ`;
    const answerExpr = fp;
    return { expr, answerExpr, isNL: true };
  }

  if (variant === 1) {
    // a·f(x)
    const a = Math.floor(rng() * 4) + 2; // [2..5]
    const [f, fp] = funcs[Math.floor(rng() * funcs.length)];
    const expr = `${a}${f} を微分せよ`;
    const answerExpr = `${a}${fp.startsWith("−") ? `(${fp})` : fp}`;
    return { expr, answerExpr, isNL: true };
  }

  // Sum/difference of two functions
  const idx1 = Math.floor(rng() * funcs.length);
  let idx2 = Math.floor(rng() * funcs.length);
  if (idx2 === idx1) idx2 = (idx1 + 1) % funcs.length;
  const [f1, fp1] = funcs[idx1];
  const [f2, fp2] = funcs[idx2];
  const isPlus = rng() < 0.5;
  const op = isPlus ? "+" : "−";
  const expr = `${f1} ${op} ${f2} を微分せよ`;
  const answerExpr = `${fp1} ${op} ${fp2}`;
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
