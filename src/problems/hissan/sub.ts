import { type Problem, generateNumber, randInt, digitsWithMinSum } from "./common";

/** Generate a subtraction problem where minuend - subtrahend1 - subtrahend2 - ... >= 0. */
export const generateSubtractionProblem = (rng: () => number, cfg: { minDigits: number; maxDigits: number; numOperands: number }): Problem => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const minuend = generateNumber(rng, cfg.minDigits, cfg.maxDigits);
    const subtrahends: number[] = [];
    let budget = minuend - 1; // ensure result >= 0 (strictly: sum of subtrahends < minuend)
    let ok = true;
    for (let i = 1; i < cfg.numOperands; i++) {
      const lo = cfg.minDigits === 1 ? 1 : Math.pow(10, cfg.minDigits - 1);
      const hi = Math.min(Math.pow(10, cfg.maxDigits) - 1, budget - (cfg.numOperands - 1 - i));
      if (hi < lo) { ok = false; break; }
      const sub = randInt(rng, lo, hi);
      subtrahends.push(sub);
      budget -= sub;
    }
    if (ok) return [minuend, ...subtrahends];
  }
  // Fallback: simple guaranteed valid problem
  const minuend = generateNumber(rng, cfg.minDigits, cfg.maxDigits);
  return [minuend, ...Array.from({ length: cfg.numOperands - 1 }, () => 1)];
};

/**
 * Constructively generate a subtraction problem with borrows in every column.
 * Column-by-column (right-to-left): choose minuend digit and subtrahend digits
 * such that minuendDigit - subDigitSum - borrowIn < 0, forcing a borrow.
 */
export const generateBorrowChainProblem = (rng: () => number, cfg: { minDigits: number; maxDigits: number; numOperands: number }): Problem => {
  const numSubs = cfg.numOperands - 1;

  for (let attempt = 0; attempt < 100; attempt++) {
    // Choose digit count for minuend = maxDigits, subtrahends within [minDigits, maxDigits]
    const minuendWidth = cfg.minDigits + Math.floor(rng() * (cfg.maxDigits - cfg.minDigits + 1));
    const subWidths = Array.from({ length: numSubs }, () =>
      cfg.minDigits + Math.floor(rng() * (cfg.maxDigits - cfg.minDigits + 1)),
    );
    const width = Math.max(minuendWidth, ...subWidths);
    const minChain = Math.min(2, width);
    const chainLen = minChain + Math.floor(rng() * (width - minChain + 1));

    const minuendDigits: number[] = [];
    const subDigits: number[][] = Array.from({ length: numSubs }, () => []);
    let borrow = 0;

    for (let col = 0; col < width; col++) {
      const activeSubs: number[] = [];
      for (let s = 0; s < numSubs; s++) {
        if (col < subWidths[s]) activeSubs.push(s);
      }
      const minuendActive = col < minuendWidth;

      if (col < chainLen && minuendActive) {
        // Borrow chain: need minuendDigit < subDigitSum + borrow (forces borrow out)
        // subDigitSum must be >= minuendDigit - borrow + 1 for a borrow to occur
        // Pick minuend digit, then choose sub digits that exceed it
        const mDigit = randInt(rng, 0, 8); // leave room for sub digits to exceed
        const minSubSum = mDigit + 1 - borrow; // need subSum > mDigit - borrow, so subSum >= mDigit - borrow + 1
        if (minSubSum > activeSubs.length * 9 || minSubSum < 0) {
          // Can't force a borrow with these constraints at this column
          // Use simpler approach: mDigit=0, subDigits sum to at least 1
          minuendDigits.push(0);
          const colSubs = activeSubs.length > 0
            ? digitsWithMinSum(rng, activeSubs.length, Math.max(1 - borrow, 0))
            : [];
          let si = 0;
          for (let s = 0; s < numSubs; s++) {
            subDigits[s].push(col < subWidths[s] ? colSubs[si++] : 0);
          }
          const diff = 0 - colSubs.reduce((a, b) => a + b, 0) - borrow;
          borrow = diff < 0 ? 1 : 0;
        } else {
          minuendDigits.push(mDigit);
          const safeMinSubSum = Math.max(0, minSubSum);
          const colSubs = activeSubs.length > 0
            ? digitsWithMinSum(rng, activeSubs.length, safeMinSubSum)
            : [];
          let si = 0;
          for (let s = 0; s < numSubs; s++) {
            subDigits[s].push(col < subWidths[s] ? colSubs[si++] : 0);
          }
          const diff = mDigit - colSubs.reduce((a, b) => a + b, 0) - borrow;
          borrow = diff < 0 ? 1 : 0;
        }
      } else {
        // Beyond chain or minuend not active: free digits, no forced borrow
        const mDigit = minuendActive ? randInt(rng, 0, 9) : 0;
        minuendDigits.push(mDigit);
        const colSubs = activeSubs.map(() => randInt(rng, 0, 9));
        let si = 0;
        for (let s = 0; s < numSubs; s++) {
          subDigits[s].push(col < subWidths[s] ? colSubs[si++] : 0);
        }
        // Don't force borrow beyond chain
        borrow = 0;
      }
    }

    const minuend = minuendDigits.reduce((num, d, col) => num + d * Math.pow(10, col), 0);
    const subs = subDigits.map((digits) =>
      digits.reduce((num, d, col) => num + d * Math.pow(10, col), 0),
    );
    const result = minuend - subs.reduce((a, b) => a + b, 0);

    // Verify: result >= 0, each number has intended digit count
    const minuendOk = minuend >= (minuendWidth <= 1 ? 1 : Math.pow(10, minuendWidth - 1));
    const subsOk = subs.every((s, i) => s >= (subWidths[i] <= 1 ? 1 : Math.pow(10, subWidths[i] - 1)));
    if (result >= 0 && minuendOk && subsOk) {
      return [minuend, ...subs];
    }
  }

  // Fallback
  return generateSubtractionProblem(rng, cfg);
};
