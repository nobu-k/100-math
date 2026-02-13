import { type HissanConfig, type Problem, generateNumber, randInt } from "./common";

export interface DivStep {
  position: number;      // column index in dividend (0-based from left)
  dividendSoFar: number; // the current partial dividend being divided
  quotientDigit: number; // digit of quotient at this position
  product: number;       // divisor × quotientDigit
  remainder: number;     // dividendSoFar - product
}

export interface DivComputed {
  quotient: number;
  remainder: number;
  steps: DivStep[];
}

/** Compute long division steps for dividend ÷ divisor. */
export const computeDivDetails = (dividend: number, divisor: number): DivComputed => {
  const digits = String(dividend).split("").map(Number);
  const steps: DivStep[] = [];
  let current = 0;
  let started = false;

  for (let i = 0; i < digits.length; i++) {
    current = current * 10 + digits[i];
    if (!started && current < divisor) continue;
    started = true;
    const quotientDigit = Math.floor(current / divisor);
    const product = divisor * quotientDigit;
    const remainder = current - product;
    steps.push({ position: i, dividendSoFar: current, quotientDigit, product, remainder });
    current = remainder;
  }

  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  return { quotient, remainder, steps };
};

/** Generate a division problem. */
export const generateDivisionProblem = (rng: () => number, cfg: HissanConfig): Problem => {
  if (!cfg.divAllowRemainder) {
    // Exact mode: generate divisor and quotient, compute dividend = divisor × quotient
    for (let attempt = 0; attempt < 100; attempt++) {
      const divisor = generateNumber(rng, cfg.divMinDigits, cfg.divMaxDigits);
      // Generate a quotient such that dividend = divisor * quotient is in range
      const minDividend = cfg.minDigits === 1 ? 1 : Math.pow(10, cfg.minDigits - 1);
      const maxDividend = Math.pow(10, cfg.maxDigits) - 1;
      const minQuotient = Math.max(1, Math.ceil(minDividend / divisor));
      const maxQuotient = Math.floor(maxDividend / divisor);
      if (minQuotient > maxQuotient) continue;
      const quotient = randInt(rng, minQuotient, maxQuotient);
      const dividend = divisor * quotient;
      if (String(dividend).length >= cfg.minDigits && String(dividend).length <= cfg.maxDigits) {
        return [dividend, divisor];
      }
    }
    // Fallback
    const divisor = generateNumber(rng, cfg.divMinDigits, cfg.divMaxDigits);
    return [divisor * 2, divisor];
  } else {
    // Remainder mode: generate dividend and divisor, ensure dividend >= divisor
    for (let attempt = 0; attempt < 100; attempt++) {
      const dividend = generateNumber(rng, cfg.minDigits, cfg.maxDigits);
      const divisor = generateNumber(rng, cfg.divMinDigits, cfg.divMaxDigits);
      if (dividend >= divisor) return [dividend, divisor];
    }
    // Fallback
    const dividend = generateNumber(rng, cfg.minDigits, cfg.maxDigits);
    return [dividend, 1];
  }
};
