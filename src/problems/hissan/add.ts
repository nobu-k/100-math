import { type HissanConfig, type Problem, randInt, digitsWithMinSum, digitsWithExactSum, generateNumber } from "./common";

/**
 * Constructively generate a problem with carries in every column.
 * - Ones column: digit sum >= 10 (produces carry).
 * - Middle columns: digit sum = 10 - carry_in (corner case, total = 10, carry out = 1).
 * - Highest column: digit sum + carry_in >= 10 (carries out).
 */
export const generateCarryChainProblem = (rng: () => number, cfg: HissanConfig): Problem => {
  const numOps = cfg.numOperands;

  for (let attempt = 0; attempt < 100; attempt++) {
    // Choose digit count for each operand independently
    const opWidths = Array.from({ length: numOps }, () =>
      cfg.minDigits + Math.floor(rng() * (cfg.maxDigits - cfg.minDigits + 1)),
    );
    const width = Math.max(...opWidths);
    // Carry chain spans 2..width columns from ones (or 1 if width=1)
    const minChain = Math.min(2, width);
    const chainLen = minChain + Math.floor(rng() * (width - minChain + 1));
    const opDigits: number[][] = Array.from({ length: numOps }, () => []);
    let carry = 0;

    for (let col = 0; col < width; col++) {
      const active: number[] = [];
      for (let op = 0; op < numOps; op++) {
        if (col < opWidths[op]) active.push(op);
      }

      let colDigits: number[];
      if (col < chainLen) {
        // Carry chain: each column must produce a carry
        if (col === 0) {
          colDigits = digitsWithMinSum(rng, active.length, 10);
        } else if (col === 1 || col < chainLen - 1) {
          // Tens column is always a corner case (digit sum = 9);
          // other middle chain columns likewise
          colDigits = digitsWithExactSum(rng, active.length, 10 - carry);
        } else {
          colDigits = digitsWithMinSum(rng, active.length, 10 - carry);
        }
      } else {
        // Beyond the chain: random digits, carry absorbed naturally
        colDigits = active.map(() => randInt(rng, 0, 9));
      }

      const total = colDigits.reduce((a, b) => a + b, 0) + carry;
      carry = Math.floor(total / 10);
      let ai = 0;
      for (let op = 0; op < numOps; op++) {
        opDigits[op].push(col < opWidths[op] ? colDigits[ai++] : 0);
      }
    }

    const numbers = opDigits.map((digits) =>
      digits.reduce((num, d, col) => num + d * Math.pow(10, col), 0),
    );
    // Verify each operand actually has its intended digit count
    if (numbers.every((n, i) => n >= (opWidths[i] <= 1 ? 1 : Math.pow(10, opWidths[i] - 1)))) {
      return numbers;
    }
  }

  // Fallback (should rarely happen)
  return Array.from({ length: numOps }, () =>
    generateNumber(rng, cfg.minDigits, cfg.maxDigits),
  );
};
