export { type Problem, type HissanOperator, type HissanConfig, type Indicators, generateNumber, randInt, digitsWithMinSum, digitsWithExactSum, toDigitCells, toDecimalDigitCells, computeIndicators, parseConfig, buildParams } from "./common";
export { generateCarryChainProblem } from "./add";
export { generateSubtractionProblem, generateBorrowChainProblem } from "./sub";
export { type MulPartialProduct, type MulComputed, computeMulDetails, generateMultiplicationProblem } from "./mul";
export { type DivStep, type DivComputed, computeDivDetails, generateDivisionProblem } from "./div";

import { mulberry32 } from "../random";
import { type HissanConfig, type Problem, generateNumber, randInt } from "./common";
import { generateCarryChainProblem } from "./add";
import { generateSubtractionProblem, generateBorrowChainProblem } from "./sub";
import { generateMultiplicationProblem } from "./mul";
import { generateDivisionProblem } from "./div";

/** Return the number of problems per page for the given config. */
export const getProblemCount = (cfg: HissanConfig): number => {
  if (cfg.operator === "div") return 6;
  if (cfg.operator === "mul" && (cfg.mulMaxDigits >= 2 || cfg.useDecimals)) return 6;
  if (cfg.useDecimals) return 8;
  return 12;
};

export const generateProblem = (rng: () => number, cfg: HissanConfig): Problem => {
  if (cfg.operator === "div") return generateDivisionProblem(rng, cfg);
  if (cfg.operator === "mul") return generateMultiplicationProblem(rng, cfg);
  if (cfg.operator === "sub") {
    if (cfg.consecutiveCarries) return generateBorrowChainProblem(rng, cfg);
    return generateSubtractionProblem(rng, cfg);
  }
  if (cfg.consecutiveCarries) return generateCarryChainProblem(rng, cfg);
  return Array.from({ length: cfg.numOperands }, () =>
    generateNumber(rng, cfg.minDigits, cfg.maxDigits),
  );
};

export interface GenerateResult {
  problems: Problem[];
  decimalPlaces: number[][];
}

export const generateProblems = (seed: number, cfg: HissanConfig): GenerateResult => {
  const rng = mulberry32(seed);
  const count = getProblemCount(cfg);
  const problems = Array.from({ length: count }, () => generateProblem(rng, cfg));

  let decimalPlaces: number[][];
  if (cfg.useDecimals && (cfg.operator === "add" || cfg.operator === "sub")) {
    decimalPlaces = problems.map((problem) => {
      // Use the same dp for all operands so decimal columns overlap
      const digitCounts = problem.map((op) => String(op).length);
      const minDP = Math.max(1, ...digitCounts.map((n) => n - 2));
      const maxDP = Math.max(...digitCounts);
      const dp = randInt(rng, minDP, maxDP);
      return problem.map(() => dp);
    });
  } else if (cfg.useDecimals && cfg.operator === "mul") {
    // Pick decimal places for an operand.
    // For multi-digit numbers, bias toward >1 decimals (0 < dp < numDigits)
    // since uniform over [0, numDigits] underrepresents that range.
    const pickDp = (n: number, forceNonZero: boolean): number => {
      if (n % 10 === 0) return 0; // multiples of 10: no decimal (trailing zeros)
      const numDigits = String(n).length;
      if (numDigits === 1) {
        // 1-digit: only integer or <1 possible (no >1 decimal exists)
        if (forceNonZero) return 1;
        return rng() < 0.5 ? 0 : 1;
      }
      // Multi-digit: weight toward >1 decimals
      if (forceNonZero) {
        return rng() < 0.2 ? numDigits : randInt(rng, 1, numDigits - 1);
      }
      const r = rng();
      if (r < 0.2) return 0;           // 20% integer
      if (r < 0.35) return numDigits;   // 15% <1
      return randInt(rng, 1, numDigits - 1); // 65% >1 decimal
    };

    decimalPlaces = problems.map((problem) => {
      const [multiplicand, multiplier] = problem;
      let dp1 = pickDp(multiplicand, false);
      let dp2 = pickDp(multiplier, false);
      // Ensure at least one has dp > 0 (when possible)
      if (dp1 === 0 && dp2 === 0) {
        if (rng() < 0.5) {
          dp1 = pickDp(multiplicand, true);
          if (dp1 === 0) dp2 = pickDp(multiplier, true);
        } else {
          dp2 = pickDp(multiplier, true);
          if (dp2 === 0) dp1 = pickDp(multiplicand, true);
        }
      }
      return [dp1, dp2];
    });
  } else {
    decimalPlaces = problems.map((problem) => problem.map((): number => 0));
  }

  return { problems, decimalPlaces };
};
