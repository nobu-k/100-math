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
  if (cfg.operator === "mul" && cfg.mulMaxDigits >= 2) return 6;
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
  if (cfg.useDecimals && cfg.operator === "add") {
    decimalPlaces = problems.map((problem) => {
      // Use the same dp for all operands so decimal columns overlap
      const digitCounts = problem.map((op) => String(op).length);
      const minDP = Math.max(1, ...digitCounts.map((n) => n - 2));
      const maxDP = Math.max(...digitCounts);
      const dp = randInt(rng, minDP, maxDP);
      return problem.map(() => dp);
    });
  } else {
    decimalPlaces = problems.map((problem) => problem.map((): number => 0));
  }

  return { problems, decimalPlaces };
};
