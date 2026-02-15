import { seedToHex } from "../random";

export type Problem = number[];
export type HissanOperator = "add" | "sub" | "mul" | "div";

export interface HissanConfig {
  minDigits: number;
  maxDigits: number;
  numOperands: number;
  consecutiveCarries: boolean;
  showGrid: boolean;
  operator: HissanOperator;
  mulMinDigits: number;
  mulMaxDigits: number;
  divMinDigits: number;
  divMaxDigits: number;
  divAllowRemainder: boolean;
  divAllowRepeating: boolean;
  useDecimals: boolean;
}

export const generateNumber = (rng: () => number, minDigits: number, maxDigits: number): number => {
  const digits = minDigits + Math.floor(rng() * (maxDigits - minDigits + 1));
  const lo = digits === 1 ? 1 : Math.pow(10, digits - 1);
  const hi = Math.pow(10, digits) - 1;
  return Math.floor(rng() * (hi - lo + 1)) + lo;
};

/** Pick a random integer in [lo, hi] inclusive. */
export const randInt = (rng: () => number, lo: number, hi: number): number =>
  lo + Math.floor(rng() * (hi - lo + 1));

/** Generate n digits (each 0-9) whose sum >= minSum. */
export const digitsWithMinSum = (rng: () => number, n: number, minSum: number): number[] => {
  const result: number[] = [];
  let need = minSum;
  for (let i = 0; i < n; i++) {
    const left = n - i - 1;
    const lo = Math.max(0, need - left * 9);
    const d = randInt(rng, lo, 9);
    result.push(d);
    need = Math.max(0, need - d);
  }
  return result;
};

/** Generate n digits (each 0-9) whose sum = exactSum. */
export const digitsWithExactSum = (rng: () => number, n: number, exactSum: number): number[] => {
  const result: number[] = [];
  let remaining = exactSum;
  for (let i = 0; i < n; i++) {
    const left = n - i - 1;
    const lo = Math.max(0, remaining - left * 9);
    const hi = Math.min(9, remaining);
    const d = randInt(rng, lo, hi);
    result.push(d);
    remaining -= d;
  }
  return result;
};

/** Convert a number to an array of digits, padded to `width` with empty strings on the left. */
export const toDigitCells = (n: number, width: number): (number | "")[] => {
  const str = String(n);
  const cells: (number | "")[] = Array(width).fill("");
  for (let i = 0; i < str.length; i++) {
    cells[width - str.length + i] = parseInt(str[i], 10);
  }
  return cells;
};

/**
 * Convert an integer operand with `dp` decimal places into digit cells
 * for display, split into integer-part columns and decimal-part columns.
 * Integer digits are right-aligned in `totalIntCols`; decimal digits are
 * left-aligned in `totalDecCols`. When dp >= numDigits the integer part
 * shows "0". Trailing decimal positions beyond dp are left empty (operands)
 * or filled with zeros (answer — caller passes dp = maxDP in that case).
 */
export const toDecimalDigitCells = (
  operand: number,
  dp: number,
  totalIntCols: number,
  totalDecCols: number,
): (number | "")[] => {
  const str = String(operand);
  const numDigits = str.length;

  // Integer part: right-aligned in totalIntCols
  const intCells: (number | "")[] = Array(totalIntCols).fill("");
  if (dp >= numDigits) {
    // All digits are after the decimal; integer part is 0
    intCells[totalIntCols - 1] = 0;
  } else {
    const intStr = str.slice(0, numDigits - dp);
    for (let i = 0; i < intStr.length; i++) {
      intCells[totalIntCols - intStr.length + i] = parseInt(intStr[i], 10);
    }
  }

  // Decimal part: left-aligned in totalDecCols
  const decCells: (number | "")[] = Array(totalDecCols).fill("");
  if (dp > 0) {
    const rawDecStr = dp >= numDigits ? str : str.slice(numDigits - dp);
    const decStr = rawDecStr.padStart(dp, "0");
    for (let i = 0; i < dp; i++) {
      decCells[i] = parseInt(decStr[i], 10);
    }
  }

  return [...intCells, ...decCells];
};

export interface Indicators {
  indicators: number[];
  borrowOut: number[];
  borrowDisplay: (number | "")[];
}

/** Compute carry/borrow indicators for a problem. */
export const computeIndicators = (problem: Problem, maxDigits: number, operator: HissanOperator): Indicators => {
  const totalCols = maxDigits + 1;
  const operandDigits = problem.map((op) => toDigitCells(op, totalCols));
  const indicators = new Array<number>(totalCols).fill(0);
  const borrowOut = new Array<number>(totalCols).fill(0);
  const borrowDisplay = new Array<number | "">(totalCols).fill("");

  if (operator === "sub") {
    let borrow = 0;
    for (let col = totalCols - 1; col >= 0; col--) {
      const minuendDigit = operandDigits[0][col] === "" ? 0 : operandDigits[0][col] as number;
      let subSum = 0;
      for (let s = 1; s < operandDigits.length; s++) {
        const d = operandDigits[s][col];
        if (d !== "") subSum += d;
      }
      indicators[col] = borrow;
      const diff = minuendDigit - subSum - borrow;
      borrowOut[col] = diff < 0 ? 1 : 0;
      if (borrow > 0) {
        borrowDisplay[col] = minuendDigit - 1 + borrowOut[col] * 10;
      }
      borrow = borrowOut[col];
    }
  } else {
    let carry = 0;
    for (let col = totalCols - 1; col >= 0; col--) {
      let colSum = carry;
      for (const digits of operandDigits) {
        const d = digits[col];
        if (d !== "") colSum += d;
      }
      indicators[col] = carry;
      carry = Math.floor(colSum / 10);
    }
  }

  return { indicators, borrowOut, borrowDisplay };
};

export const parseConfig = (params: URLSearchParams): HissanConfig => {
  const hop = params.get("hop");
  const operator: HissanOperator = hop === "sub" ? "sub" : hop === "mul" ? "mul" : hop === "div" ? "div" : "add";

  let minDigits = parseInt(params.get("hmin") || "", 10);
  let maxDigits = parseInt(params.get("hmax") || "", 10);
  let numOperands = parseInt(params.get("hops") || "", 10);
  if (!(minDigits >= 1 && minDigits <= 4)) minDigits = operator === "div" ? 2 : 1;
  if (!(maxDigits >= 1 && maxDigits <= 4)) maxDigits = 2;
  if (minDigits > maxDigits) maxDigits = minDigits;
  if (!(numOperands >= 2 && numOperands <= 3)) numOperands = 2;
  const consecutiveCarries = params.get("hcc") === "1";
  const showGrid = params.get("hgrid") !== "0";

  let mulMinDigits = parseInt(params.get("hmmin") || "", 10);
  let mulMaxDigits = parseInt(params.get("hmmax") || "", 10);
  if (!(mulMinDigits >= 1 && mulMinDigits <= 3)) mulMinDigits = 1;
  if (!(mulMaxDigits >= 1 && mulMaxDigits <= 3)) mulMaxDigits = 1;
  if (mulMinDigits > mulMaxDigits) mulMaxDigits = mulMinDigits;

  let divMinDigits = parseInt(params.get("hdmin") || "", 10);
  let divMaxDigits = parseInt(params.get("hdmax") || "", 10);
  if (!(divMinDigits >= 1 && divMinDigits <= 2)) divMinDigits = 1;
  if (!(divMaxDigits >= 1 && divMaxDigits <= 2)) divMaxDigits = 1;
  if (divMinDigits > divMaxDigits) divMaxDigits = divMinDigits;
  const divAllowRemainder = params.get("hdr") === "1";
  const divAllowRepeating = params.get("hdre") === "1";
  const useDecimals = params.get("hdec") === "1";

  if (operator === "sub") numOperands = 2;
  if (operator === "mul") {
    numOperands = 2;
    if (maxDigits > 3) maxDigits = 3;
    if (minDigits > maxDigits) minDigits = maxDigits;
  }
  if (operator === "div") {
    numOperands = 2;
    if (minDigits < 2) minDigits = 2;
    if (maxDigits < minDigits) maxDigits = minDigits;
  }

  return { minDigits, maxDigits, numOperands, consecutiveCarries, showGrid, operator, mulMinDigits, mulMaxDigits, divMinDigits, divMaxDigits, divAllowRemainder, divAllowRepeating, useDecimals };
};

export const buildParams = (seed: number, showAnswers: boolean, cfg: HissanConfig): URLSearchParams => {
  const params = new URLSearchParams();
  params.set("hq", seedToHex(seed));
  if (showAnswers) {
    params.set("answers", "1");
  }
  params.set("hmin", String(cfg.minDigits));
  params.set("hmax", String(cfg.maxDigits));
  if (cfg.operator === "add") {
    params.set("hops", String(cfg.numOperands));
  }
  if (cfg.consecutiveCarries) {
    params.set("hcc", "1");
  }
  if (!cfg.showGrid) {
    params.set("hgrid", "0");
  }
  if (cfg.operator === "sub") {
    params.set("hop", "sub");
  }
  if (cfg.operator === "mul") {
    params.set("hop", "mul");
    params.set("hmmin", String(cfg.mulMinDigits));
    params.set("hmmax", String(cfg.mulMaxDigits));
  }
  if (cfg.operator === "div") {
    params.set("hop", "div");
    params.set("hdmin", String(cfg.divMinDigits));
    params.set("hdmax", String(cfg.divMaxDigits));
    if (cfg.divAllowRemainder) {
      params.set("hdr", "1");
    }
    if (cfg.divAllowRepeating) {
      params.set("hdre", "1");
    }
  }
  if (cfg.useDecimals) {
    params.set("hdec", "1");
  }
  return params;
};
