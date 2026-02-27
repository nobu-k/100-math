import { mulberry32 } from "../random";

export type LogCalcMode = "convert" | "properties" | "equations" | "mixed";

export interface LogCalcProblem {
  expr: string;
  answerExpr: string;
}

export const generateLogCalc = (
  seed: number,
  mode: LogCalcMode = "mixed",
  count = 12,
): LogCalcProblem[] => {
  const rng = mulberry32(seed);
  const problems: LogCalcProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: LogCalcProblem | null = null;
      if (pick === "convert") result = generateConvert(rng);
      else if (pick === "properties") result = generateProperties(rng);
      else result = generateEquations(rng);

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

const pickMode = (rng: () => number, mode: LogCalcMode): "convert" | "properties" | "equations" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.3) return "convert";
  if (r < 0.65) return "properties";
  return "equations";
};

const generateConvert = (rng: () => number): LogCalcProblem | null => {
  // a^b = c ↔ log_a(c) = b
  const bases = [2, 3, 4, 5, 10];
  const base = bases[Math.floor(rng() * bases.length)];
  const exp = Math.floor(rng() * 4) + 1; // [1..4]
  const value = Math.pow(base, exp);

  if (rng() < 0.5) {
    // Exponential → logarithmic
    const expr = `${base}${superscript(exp)} = ${value} を対数で表せ`;
    const answerExpr = `log${subscript(base)} ${value} = ${exp}`;
    return { expr, answerExpr };
  }
  // Evaluate logarithm
  const expr = `log${subscript(base)} ${value}`;
  const answerExpr = `${exp}`;
  return { expr, answerExpr };
};

const generateProperties = (rng: () => number): LogCalcProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // log_a(b) + log_a(c) = log_a(bc)
    const base = [2, 3, 5][Math.floor(rng() * 3)];
    const exp1 = Math.floor(rng() * 3) + 1;
    const exp2 = Math.floor(rng() * 3) + 1;
    const b = Math.pow(base, exp1);
    const c = Math.pow(base, exp2);
    const answer = exp1 + exp2;
    const expr = `log${subscript(base)} ${b} + log${subscript(base)} ${c}`;
    const answerExpr = `log${subscript(base)} ${b * c} = ${answer}`;
    return { expr, answerExpr };
  }

  if (variant === 1) {
    // log_a(b) - log_a(c) = log_a(b/c)
    const base = [2, 3, 5][Math.floor(rng() * 3)];
    const exp1 = Math.floor(rng() * 3) + 2; // [2..4]
    const exp2 = Math.floor(rng() * exp1) + 1; // [1..exp1]
    if (exp1 === exp2) return null;
    const b = Math.pow(base, exp1);
    const c = Math.pow(base, exp2);
    const answer = exp1 - exp2;
    const expr = `log${subscript(base)} ${b} − log${subscript(base)} ${c}`;
    const answerExpr = `log${subscript(base)} ${b / c} = ${answer}`;
    return { expr, answerExpr };
  }

  // Change of base: log_a(b) = log_c(b) / log_c(a)
  const a = [2, 4, 8][Math.floor(rng() * 3)];
  const b = [2, 4, 8, 16, 32][Math.floor(rng() * 5)];
  if (a === b) return null;

  // log_a(b) using base 2
  const logA = Math.log2(a);
  const logB = Math.log2(b);
  if (logA === 0) return null;
  const answer = logB / logA;

  // Only accept nice fractions
  if (!Number.isFinite(answer)) return null;
  const num = Math.round(answer * 2);
  const den = 2;
  const g = gcd(Math.abs(num), den);
  const rn = num / g;
  const rd = den / g;

  const expr = `log${subscript(a)} ${b}`;
  const answerExpr = rd === 1 ? `${rn}` : `${rn}/${rd}`;
  return { expr, answerExpr };
};

const generateEquations = (rng: () => number): LogCalcProblem | null => {
  const variant = Math.floor(rng() * 2);

  if (variant === 0) {
    // Solve log_a(x) = b → x = a^b
    const bases = [2, 3, 5, 10];
    const base = bases[Math.floor(rng() * bases.length)];
    const b = Math.floor(rng() * 4) + 1;
    const answer = Math.pow(base, b);
    const expr = `log${subscript(base)} x = ${b} を解け`;
    const answerExpr = `x = ${answer}`;
    return { expr, answerExpr };
  }

  // Solve a^x = b where b = a^k
  const bases = [2, 3, 5];
  const base = bases[Math.floor(rng() * bases.length)];
  const k = Math.floor(rng() * 5) + 1;
  const b = Math.pow(base, k);
  const expr = `${base}ˣ = ${b} を解け`;
  const answerExpr = `x = ${k}`;
  return { expr, answerExpr };
};

const superscript = (n: number): string => {
  const sup: Record<number, string> = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
  return sup[n] ?? `^${n}`;
};

const subscript = (n: number): string => {
  const sub: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  };
  return `${n}`.split("").map((d) => sub[d] ?? d).join("");
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
