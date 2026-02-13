import { type HissanConfig, type Problem, generateNumber } from "./common";

export interface MulPartialProduct {
  value: number;
  carries: number[];
  shift: number;
}

export interface MulComputed {
  partials: MulPartialProduct[];
  finalAnswer: number;
}

/** Compute partial products and carries for multiplicand × multiplier. */
export const computeMulDetails = (multiplicand: number, multiplier: number): MulComputed => {
  const mDigits = String(multiplier);
  const partials: MulPartialProduct[] = [];

  for (let i = mDigits.length - 1; i >= 0; i--) {
    const d = parseInt(mDigits[i], 10);
    const shift = mDigits.length - 1 - i;
    const partial = multiplicand * d;
    // Compute carries for each digit of the multiplication
    const carries: number[] = [];
    let carry = 0;
    const mcandStr = String(multiplicand);
    for (let j = mcandStr.length - 1; j >= 0; j--) {
      const mcandDigit = parseInt(mcandStr[j], 10);
      const product = mcandDigit * d + carry;
      carry = Math.floor(product / 10);
      carries.unshift(carry);
    }
    partials.push({ value: partial, carries, shift });
  }

  const finalAnswer = multiplicand * multiplier;
  return { partials, finalAnswer };
};

/** Generate a multiplication problem. */
export const generateMultiplicationProblem = (rng: () => number, cfg: HissanConfig): Problem => {
  const multiplicand = generateNumber(rng, cfg.minDigits, cfg.maxDigits);
  const multiplier = generateNumber(rng, cfg.mulMinDigits, cfg.mulMaxDigits);
  return [multiplicand, multiplier];
};
