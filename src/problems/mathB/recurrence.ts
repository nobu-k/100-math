import { mulberry32 } from "../random";

export interface RecurrenceProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateRecurrence = (
  seed: number,
  count = 10,
): RecurrenceProblem[] => {
  const rng = mulberry32(seed);
  const problems: RecurrenceProblem[] = [];
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

const generateOne = (rng: () => number): RecurrenceProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) return generateComputeTerms(rng);
  if (variant === 1) return generateLinearRecurrence(rng);
  return generateFibonacci(rng);
};

const generateComputeTerms = (rng: () => number): RecurrenceProblem | null => {
  // a₁ = c, aₙ₊₁ = p·aₙ + q. Find a₂, a₃, a₄
  const a1 = Math.floor(rng() * 5) + 1;
  const p = Math.floor(rng() * 3) + 2;
  const q = Math.floor(rng() * 7) - 3;

  const a2 = p * a1 + q;
  const a3 = p * a2 + q;
  const a4 = p * a3 + q;

  if (Math.abs(a4) > 1000) return null;

  const recStr = q === 0 ? `${p}aₙ` :
    (q > 0 ? `${p}aₙ + ${q}` : `${p}aₙ − ${-q}`);
  const expr = `a₁ = ${a1}, aₙ₊₁ = ${recStr} のとき，a₂, a₃, a₄`;
  const answerExpr = `a₂ = ${fmt(a2)}, a₃ = ${fmt(a3)}, a₄ = ${fmt(a4)}`;
  return { expr, answerExpr, isNL: true };
};

const generateLinearRecurrence = (rng: () => number): RecurrenceProblem | null => {
  // aₙ₊₁ = p·aₙ + q → general term via characteristic equation
  // aₙ = (a₁ − q/(1−p))·pⁿ⁻¹ + q/(1−p)
  const p = Math.floor(rng() * 3) + 2; // 2, 3, or 4
  const q = Math.floor(rng() * 5) + 1;
  const a1 = Math.floor(rng() * 5) + 1;

  // Compute first few terms
  const a2 = p * a1 + q;
  const a3 = p * a2 + q;
  if (Math.abs(a3) > 500) return null;

  const recStr = q > 0 ? `${p}aₙ + ${q}` : `${p}aₙ − ${-q}`;
  const expr = `a₁ = ${a1}, aₙ₊₁ = ${recStr} のとき，a₂ と a₃`;
  const answerExpr = `a₂ = ${fmt(a2)}, a₃ = ${fmt(a3)}`;
  return { expr, answerExpr, isNL: true };
};

const generateFibonacci = (rng: () => number): RecurrenceProblem | null => {
  // aₙ₊₂ = aₙ₊₁ + aₙ with custom initial values
  const a1 = Math.floor(rng() * 4) + 1;
  const a2 = Math.floor(rng() * 4) + 1;

  const terms = [a1, a2];
  for (let i = 2; i < 8; i++) {
    terms.push(terms[i - 1] + terms[i - 2]);
  }

  const target = Math.floor(rng() * 4) + 5; // a₅ to a₈
  if (target >= terms.length) return null;

  const expr = `a₁ = ${a1}, a₂ = ${a2}, aₙ₊₂ = aₙ₊₁ + aₙ のとき，a${subscript(target)}`;
  const answerExpr = `a${subscript(target)} = ${terms[target - 1]}`;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const subscript = (n: number): string => {
  const sub: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  };
  return `${n}`.split("").map((d) => sub[d] ?? d).join("");
};
