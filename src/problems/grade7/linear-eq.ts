import { mulberry32 } from "../random";

export type LinearEqMode = "basic" | "advanced" | "mixed";

export interface LinearEqProblem {
  /** Display equation, e.g. "3x + 5 = 14" */
  equation: string;
  /** The answer (x value) */
  answer: number;
  /** Whether answer is a fraction */
  isFraction: boolean;
  /** Fraction numerator (if fraction) */
  fracNum?: number;
  /** Fraction denominator (if fraction) */
  fracDen?: number;
}

function formatLinearSide(coeff: number, constant: number): string {
  const parts: string[] = [];
  if (coeff !== 0) {
    if (coeff === 1) parts.push("x");
    else if (coeff === -1) parts.push("−x");
    else parts.push(`${coeff}x`);
  }
  if (constant !== 0) {
    if (parts.length === 0) {
      parts.push(`${constant}`);
    } else if (constant > 0) {
      parts.push(`+ ${constant}`);
    } else {
      parts.push(`− ${Math.abs(constant)}`);
    }
  }
  if (parts.length === 0) return "0";
  return parts.join(" ");
}

export function generateLinearEq(
  seed: number,
  mode: LinearEqMode = "mixed",
): LinearEqProblem[] {
  const rng = mulberry32(seed);
  const problems: LinearEqProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick =
        mode === "mixed"
          ? rng() < 0.5
            ? "basic"
            : "advanced"
          : mode;

      let equation: string;
      let answer: number;
      let isFraction = false;
      let fracNum: number | undefined;
      let fracDen: number | undefined;

      if (pick === "basic") {
        // ax + b = c form
        answer = Math.floor(rng() * 17) - 8; // -8 to 8
        if (answer === 0 && rng() < 0.8) continue; // mostly avoid 0
        const a = Math.floor(rng() * 7) + 1; // 1-7
        const signA = rng() < 0.4 ? -1 : 1;
        const coeff = signA * a;
        const b = Math.floor(rng() * 15) - 7;
        const c = coeff * answer + b;
        if (Math.abs(c) > 30) continue;
        equation = `${formatLinearSide(coeff, b)} = ${c}`;
      } else {
        // advanced: ax + b = cx + d (x on both sides) or with brackets
        const subtype = rng();
        if (subtype < 0.4) {
          // ax + b = cx + d
          answer = Math.floor(rng() * 11) - 5;
          const a = Math.floor(rng() * 6) + 1;
          const c = Math.floor(rng() * 6) + 1;
          if (a === c) continue;
          const signA = rng() < 0.3 ? -1 : 1;
          const signC = rng() < 0.3 ? -1 : 1;
          const coeffL = signA * a;
          const coeffR = signC * c;
          const b = Math.floor(rng() * 11) - 5;
          const d = coeffL * answer + b - coeffR * answer;
          if (Math.abs(d) > 20) continue;
          equation = `${formatLinearSide(coeffL, b)} = ${formatLinearSide(coeffR, d)}`;
        } else if (subtype < 0.7) {
          // a(x + b) = c form (brackets)
          answer = Math.floor(rng() * 11) - 5;
          const a = Math.floor(rng() * 5) + 2; // 2-6
          const signA = rng() < 0.3 ? -1 : 1;
          const coeff = signA * a;
          const b = Math.floor(rng() * 11) - 5;
          const c = coeff * (answer + b);
          if (Math.abs(c) > 30) continue;
          const inner = b >= 0 ? `x + ${b}` : `x − ${Math.abs(b)}`;
          equation = `${coeff}(${inner}) = ${c}`;
        } else {
          // a(x + b) = cx + d form
          answer = Math.floor(rng() * 11) - 5;
          const a = Math.floor(rng() * 4) + 2;
          const b = Math.floor(rng() * 9) - 4;
          const c = Math.floor(rng() * 5) + 1;
          if (a === c) continue;
          const d = a * (answer + b) - c * answer;
          if (Math.abs(d) > 30) continue;
          const inner = b >= 0 ? `x + ${b}` : `x − ${Math.abs(b)}`;
          equation = `${a}(${inner}) = ${formatLinearSide(c, d)}`;
        }
      }

      if (!seen.has(equation) || attempt === 39) {
        seen.add(equation);
        problems.push({ equation, answer, isFraction, fracNum, fracDen });
        break;
      }
    }
  }
  return problems;
}
