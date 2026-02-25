import { type Problem, generateNumber, randInt, numberToDigits } from "./common";

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
  extraStepCount: number;
  cycleStart?: number;  // index into extra steps where repeating cycle begins (0-based)
  cycleLength?: number; // number of digits in the repeating cycle
}

/** Compute long division steps for dividend ÷ divisor.
 *  When extraDigits > 0, continue bringing down zeros after all dividend
 *  digits are consumed (for decimal extension). */
export const computeDivDetails = (dividend: number, divisor: number, extraDigits: number = 0): DivComputed => {
  const digits = numberToDigits(dividend);
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

  // Extra steps: bring down zeros for decimal extension
  let extraStepCount = 0;
  let cycleStart: number | undefined;
  let cycleLength: number | undefined;
  const remainderToExtraStep = new Map<number, number>();
  remainderToExtraStep.set(current, 0);

  for (let e = 0; e < extraDigits; e++) {
    if (current === 0) break;
    current = current * 10;
    const quotientDigit = Math.floor(current / divisor);
    const product = divisor * quotientDigit;
    const remainder = current - product;
    steps.push({ position: digits.length + e, dividendSoFar: current, quotientDigit, product, remainder });
    current = remainder;
    extraStepCount++;

    if (remainderToExtraStep.has(current)) {
      cycleStart = remainderToExtraStep.get(current)!;
      cycleLength = (e + 1) - cycleStart;
      break;
    }
    remainderToExtraStep.set(current, e + 1);
  }

  const quotient = Math.floor(dividend / divisor);
  const finalRemainder = extraStepCount > 0 && steps.length > 0
    ? steps[steps.length - 1].remainder
    : dividend % divisor;
  return { quotient, remainder: finalRemainder, steps, extraStepCount, cycleStart, cycleLength };
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

/** Detect the cycle in the decimal expansion of dividend ÷ divisor.
 *  Returns cycleStart (number of non-repeating extension digits) and
 *  cycleLength, or null if the division terminates or no cycle is found
 *  within maxSteps. */
export const divisionCycleLength = (dividend: number, divisor: number, maxSteps: number): { cycleStart: number; cycleLength: number } | null => {
  let remainder = dividend % divisor;
  if (remainder === 0) return null;
  const seen = new Map<number, number>();
  seen.set(remainder, 0);
  for (let i = 1; i <= maxSteps; i++) {
    remainder = (remainder * 10) % divisor;
    if (remainder === 0) return null;
    if (seen.has(remainder)) {
      const cycleStart = seen.get(remainder)!;
      return { cycleStart, cycleLength: i - cycleStart };
    }
    seen.set(remainder, i);
  }
  return null;
};

/** Generate a division problem. */
export const generateDivisionProblem = (rng: () => number, cfg: { minDigits: number; maxDigits: number; divMinDigits: number; divMaxDigits: number; divAllowRemainder: boolean }): Problem => {
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
