import { mulberry32 } from "../random";

export interface DivisionProblem {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

export const generateDivision = (
  seed: number,
  remainderMode: "none" | "yes" | "mixed",
): DivisionProblem[] => {
  const rng = mulberry32(seed);
  const problems: DivisionProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 15; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const divisor = 2 + Math.floor(rng() * 8);
      const useRemainder =
        remainderMode === "none" ? false :
        remainderMode === "yes" ? true :
        rng() < 0.5;

      let dividend: number, quotient: number, remainder: number;
      if (useRemainder) {
        quotient = 1 + Math.floor(rng() * 9);
        remainder = 1 + Math.floor(rng() * (divisor - 1));
        dividend = divisor * quotient + remainder;
      } else {
        quotient = 1 + Math.floor(rng() * 9);
        dividend = divisor * quotient;
        remainder = 0;
      }

      const key = `${dividend}-${divisor}`;
      if (!seen.has(key) || attempt === 19) {
        seen.add(key);
        problems.push({ dividend, divisor, quotient, remainder });
        break;
      }
    }
  }
  return problems;
};
