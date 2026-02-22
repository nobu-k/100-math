import { mulberry32 } from "../random";

export type PosNegMulDivMode = "mul" | "div" | "mixed" | "power";

export interface PosNegMulDivProblem {
  /** Display expression string, e.g. "(−3) × (+4)" */
  expr: string;
  /** The answer */
  answer: number;
}

function formatSigned(n: number): string {
  if (n >= 0) return `(+${n})`;
  return `(${n})`;
}

export function generatePosNegMulDiv(
  seed: number,
  mode: PosNegMulDivMode = "mixed",
): PosNegMulDivProblem[] {
  const rng = mulberry32(seed);
  const problems: PosNegMulDivProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 15; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      let expr: string;
      let answer: number;

      const pick =
        mode === "mixed"
          ? rng() < 0.4
            ? "mul"
            : rng() < 0.7
              ? "div"
              : "power"
          : mode;

      if (pick === "power") {
        const base = Math.floor(rng() * 9) - 4; // -4 to 4
        if (base === 0) continue;
        const exp = rng() < 0.5 ? 2 : 3;
        answer = Math.pow(base, exp);
        expr = `${formatSigned(base)}${exp === 2 ? "²" : "³"}`;
      } else if (pick === "div") {
        // Generate divisible pair by reverse: answer * divisor = dividend
        const divisor = Math.floor(rng() * 9) + 1; // 1-9
        const quotient = Math.floor(rng() * 9) + 1; // 1-9
        const signA = rng() < 0.5 ? 1 : -1;
        const signB = rng() < 0.5 ? 1 : -1;
        const dividend = signA * divisor * quotient;
        const div = signB * divisor;
        if (div === 0) continue;
        answer = dividend / div;
        expr = `${formatSigned(dividend)} ÷ ${formatSigned(div)}`;
      } else {
        // Multiplication
        const a = Math.floor(rng() * 17) - 8; // -8 to 8
        const b = Math.floor(rng() * 17) - 8;
        if (a === 0 || b === 0) continue;
        answer = a * b;
        expr = `${formatSigned(a)} × ${formatSigned(b)}`;
      }

      if (Math.abs(answer) > 100) continue;

      if (!seen.has(expr) || attempt === 29) {
        seen.add(expr);
        problems.push({ expr, answer });
        break;
      }
    }
  }
  return problems;
}
