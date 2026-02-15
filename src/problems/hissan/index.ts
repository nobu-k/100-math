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

/** Check whether dividend ÷ divisor terminates within maxExtraSteps
 *  additional decimal extension steps (bringing down zeros). */
export const divisionTerminates = (dividend: number, divisor: number, maxExtraSteps: number): { terminates: boolean; stepsNeeded: number } => {
  let remainder = dividend % divisor;
  if (remainder === 0) return { terminates: true, stepsNeeded: 0 };
  for (let i = 1; i <= maxExtraSteps; i++) {
    remainder = (remainder * 10) % divisor;
    if (remainder === 0) return { terminates: true, stepsNeeded: i };
  }
  return { terminates: false, stepsNeeded: 0 };
};

export interface GenerateResult {
  problems: Problem[];
  decimalPlaces: number[][];
  divExtra?: { extraDigits: number }[];
}

export const generateProblems = (seed: number, cfg: HissanConfig): GenerateResult => {
  const rng = mulberry32(seed);
  const count = getProblemCount(cfg);

  let problems: Problem[];
  let divExtra: { extraDigits: number }[] | undefined;

  if (cfg.useDecimals && cfg.operator === "div") {
    // Mix exact (pattern 1) and finite-extension (pattern 2) problems
    problems = [];
    divExtra = [];
    for (let i = 0; i < count; i++) {
      if (rng() < 0.5) {
        // Try finite extension (pattern 2)
        let found = false;
        for (let attempt = 0; attempt < 50; attempt++) {
          const problem = generateDivisionProblem(rng, { ...cfg, divAllowRemainder: true });
          const [dividend, divisor] = problem;
          if (dividend % divisor !== 0) {
            const result = divisionTerminates(dividend, divisor, 3);
            if (result.terminates) {
              problems.push(problem);
              divExtra.push({ extraDigits: result.stepsNeeded });
              found = true;
              break;
            }
          }
        }
        if (!found) {
          problems.push(generateDivisionProblem(rng, { ...cfg, divAllowRemainder: false }));
          divExtra.push({ extraDigits: 0 });
        }
      } else {
        // Exact (pattern 1)
        problems.push(generateDivisionProblem(rng, { ...cfg, divAllowRemainder: false }));
        divExtra.push({ extraDigits: 0 });
      }
    }
  } else {
    problems = Array.from({ length: count }, () => generateProblem(rng, cfg));
  }

  let decimalPlaces: number[][];
  if (cfg.useDecimals && (cfg.operator === "add" || cfg.operator === "sub")) {
    decimalPlaces = problems.map((problem) => {
      // Each operand gets its own dp (decimal points may differ).
      // The rendering aligns on the decimal point and trims trailing zeros.
      const dps = problem.map((op) => {
        const numDigits = String(op).length;
        const opMinDP = Math.max(1, numDigits - 2); // keep integer part ≤ 2 digits
        const opMaxDP = numDigits;
        if (opMinDP === opMaxDP) return opMinDP;
        // Bias toward smaller dp (produces >1 numbers);
        // dp = numDigits makes the operand <1.
        const r = rng();
        if (r < 0.2) return opMaxDP;
        return randInt(rng, opMinDP, opMaxDP - 1);
      });
      // For subtraction, ensure minuend dp ≤ subtrahend dp so the
      // decimal answer stays non-negative (minuend ≥ subtrahend as integers,
      // and a smaller dp keeps the minuend's decimal value larger).
      if (cfg.operator === "sub" && dps[0] > dps[1]) {
        [dps[0], dps[1]] = [dps[1], dps[0]];
      }
      return dps;
    });
  } else if (cfg.useDecimals && cfg.operator === "div") {
    decimalPlaces = problems.map((problem) => {
      const [dividend] = problem;
      const numDigits = String(dividend).length;
      let dp: number;
      if (dividend % 10 === 0) {
        dp = 1; // trailing zero: just use dp=1 (e.g. 20 → 2.0)
      } else if (numDigits === 1) {
        dp = 1;
      } else {
        dp = rng() < 0.2 ? numDigits : randInt(rng, 1, numDigits - 1);
      }
      return [dp, 0];
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

  return { problems, decimalPlaces, divExtra };
};
