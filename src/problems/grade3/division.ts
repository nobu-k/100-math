import { mulberry32 } from "../random";

export interface DivisionProblem {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

export function generateDivision(
  seed: number,
  remainderMode: "none" | "yes" | "mixed",
): DivisionProblem[] {
  const rng = mulberry32(seed);
  const problems: DivisionProblem[] = [];

  for (let i = 0; i < 15; i++) {
    const divisor = 2 + Math.floor(rng() * 8);
    const useRemainder =
      remainderMode === "none" ? false :
      remainderMode === "yes" ? true :
      rng() < 0.5;

    if (useRemainder) {
      const quotient = 1 + Math.floor(rng() * 9);
      const remainder = 1 + Math.floor(rng() * (divisor - 1));
      const dividend = divisor * quotient + remainder;
      problems.push({ dividend, divisor, quotient, remainder });
    } else {
      const quotient = 1 + Math.floor(rng() * 9);
      const dividend = divisor * quotient;
      problems.push({ dividend, divisor, quotient, remainder: 0 });
    }
  }
  return problems;
}
