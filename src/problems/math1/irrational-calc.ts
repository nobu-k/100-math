import { mulberry32 } from "../random";
import { simplifyRoot } from "../shared/latex-format";
import { gcd } from "../shared/math-utils";

export type IrrationalCalcMode = "simplify" | "rationalize" | "expand" | "mixed";

export interface IrrationalCalcProblem {
  expr: string;
  answerExpr: string;
}

export const generateIrrationalCalc = (
  seed: number,
  mode: IrrationalCalcMode = "mixed",
  count = 12,
): IrrationalCalcProblem[] => {
  const rng = mulberry32(seed);
  const problems: IrrationalCalcProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: IrrationalCalcProblem | null = null;
      if (pick === "simplify") result = generateSimplify(rng);
      else if (pick === "rationalize") result = generateRationalize(rng);
      else result = generateExpand(rng);

      if (!result) continue;

      const key = result.expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push(result);
        break;
      }
    }
  }
  return problems;
};

/* ================================================================
   Mode selection
   ================================================================ */

const pickMode = (
  rng: () => number,
  mode: IrrationalCalcMode,
): "simplify" | "rationalize" | "expand" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "simplify";
  if (r < 0.65) return "rationalize";
  return "expand";
};

/* ================================================================
   Simplify mode
   ================================================================ */

const generateSimplify = (rng: () => number): IrrationalCalcProblem | null => {
  const variant = rng();

  if (variant < 0.35) {
    // Single root simplification: sqrt(n*p^2) -> p*sqrt(n)
    return generateSingleRootSimplify(rng);
  } else if (variant < 0.65) {
    // Like terms: a*sqrt(n) + b*sqrt(n) -> (a+b)*sqrt(n)
    return generateLikeTerms(rng);
  } else {
    // Combine roots: sqrt(A) + sqrt(B) where both simplify to multiples of sqrt(n)
    return generateCombineRoots(rng);
  }
};

const generateSingleRootSimplify = (rng: () => number): IrrationalCalcProblem | null => {
  const squareFactors = [2, 3, 5];
  const innerPrimes = [2, 3, 5, 7];
  const p = squareFactors[Math.floor(rng() * squareFactors.length)];
  const n = innerPrimes[Math.floor(rng() * innerPrimes.length)];
  const radicand = n * p * p;
  if (radicand < 8) return null;

  const [outer, inner] = simplifyRoot(radicand);
  const answerExpr = formatRootUnicode(outer, inner);

  return { expr: `√${radicand}`, answerExpr };
};

const generateLikeTerms = (rng: () => number): IrrationalCalcProblem | null => {
  const bases = [2, 3, 5, 6, 7];
  const base = bases[Math.floor(rng() * bases.length)];
  const a = Math.floor(rng() * 7) + 1; // 1..7
  const b = Math.floor(rng() * 7) + 1; // 1..7
  const subtract = rng() < 0.4;

  const aStr = a === 1 ? "" : `${a}`;
  const bStr = b === 1 ? "" : `${b}`;

  let expr: string;
  let sum: number;
  if (subtract) {
    if (a <= b) return null; // avoid zero or negative result
    expr = `${aStr}√${base} − ${bStr}√${base}`;
    sum = a - b;
  } else {
    expr = `${aStr}√${base} + ${bStr}√${base}`;
    sum = a + b;
  }

  const answerExpr = formatRootUnicode(sum, base);
  return { expr, answerExpr };
};

const generateCombineRoots = (rng: () => number): IrrationalCalcProblem | null => {
  // sqrt(A) +/- sqrt(B) where A = a^2 * n, B = b^2 * n
  const bases = [2, 3, 5, 7];
  const base = bases[Math.floor(rng() * bases.length)];
  const multipliers = [2, 3, 4, 5];
  const m1 = multipliers[Math.floor(rng() * multipliers.length)];
  const m2Candidates = multipliers.filter((m) => m !== m1);
  const m2 = m2Candidates[Math.floor(rng() * m2Candidates.length)];

  const A = m1 * m1 * base;
  const B = m2 * m2 * base;
  const subtract = rng() < 0.4;

  let expr: string;
  let resultCoeff: number;
  if (subtract) {
    const big = Math.max(m1, m2);
    const small = Math.min(m1, m2);
    const bigRad = big * big * base;
    const smallRad = small * small * base;
    expr = `√${bigRad} − √${smallRad}`;
    resultCoeff = big - small;
  } else {
    expr = `√${A} + √${B}`;
    resultCoeff = m1 + m2;
  }

  const answerExpr = formatRootUnicode(resultCoeff, base);
  return { expr, answerExpr };
};

/* ================================================================
   Rationalize mode
   ================================================================ */

const generateRationalize = (rng: () => number): IrrationalCalcProblem | null => {
  const variant = rng();

  if (variant < 0.4) {
    // k / sqrt(a) -> k*sqrt(a) / a
    return generateSimpleRationalize(rng);
  } else if (variant < 0.7) {
    // 1 / sqrt(a) -> sqrt(a) / a
    return generateUnitRationalize(rng);
  } else {
    // a / (sqrt(b) + c) -> conjugate
    return generateConjugateRationalize(rng);
  }
};

const generateUnitRationalize = (rng: () => number): IrrationalCalcProblem | null => {
  const bases = [2, 3, 5, 6, 7];
  const a = bases[Math.floor(rng() * bases.length)];

  const expr = `1/√${a}`;
  const answerExpr = `√${a}/${a}`;
  return { expr, answerExpr };
};

const generateSimpleRationalize = (rng: () => number): IrrationalCalcProblem | null => {
  const bases = [2, 3, 5, 6, 7];
  const a = bases[Math.floor(rng() * bases.length)];
  const k = Math.floor(rng() * 8) + 2; // 2..9

  const expr = `${k}/√${a}`;

  // k/sqrt(a) = k*sqrt(a)/a, then reduce k/a
  const g = gcd(k, a);
  const numCoeff = k / g;
  const den = a / g;

  if (den === 1) {
    // Result is just numCoeff * sqrt(a)
    const answerExpr = formatRootUnicode(numCoeff, a);
    return { expr, answerExpr };
  }

  const numStr = numCoeff === 1 ? "" : `${numCoeff}`;
  const answerExpr = `${numStr}√${a}/${den}`;
  return { expr, answerExpr };
};

const generateConjugateRationalize = (rng: () => number): IrrationalCalcProblem | null => {
  // a / (sqrt(b) + c) => a(sqrt(b) - c) / (b - c^2)
  // or a / (sqrt(b) - c) => a(sqrt(b) + c) / (b - c^2)
  const bases = [2, 3, 5, 7];
  const b = bases[Math.floor(rng() * bases.length)];
  const c = Math.floor(rng() * 3) + 1; // 1..3
  const denom = b - c * c;
  if (denom === 0 || denom === 1 || denom === -1) return null;

  const numer = Math.floor(rng() * 5) + 1; // 1..5
  const subtract = rng() < 0.5;

  let expr: string;
  if (subtract) {
    expr = `${numer}/(√${b} − ${c})`;
  } else {
    expr = `${numer}/(√${b} + ${c})`;
  }

  // After rationalization:
  // numer / (sqrt(b) +/- c) * (sqrt(b) -/+ c) / (sqrt(b) -/+ c)
  // = numer * (sqrt(b) -/+ c) / (b - c^2)
  const absDenom = Math.abs(denom);
  const g = gcd(numer, absDenom);
  let rNum = numer / g;
  let rDen = absDenom / g;

  // If denom is negative, flip the sign of the conjugate operation
  // denom = b - c^2; if negative, the conjugate term sign flips
  let conjugateSign: string;
  if (denom > 0) {
    conjugateSign = subtract ? "+" : "−";
  } else {
    conjugateSign = subtract ? "−" : "+";
    // denom is negative, so we absorbed the sign into conjugateSign
  }

  let answerExpr: string;
  if (rDen === 1) {
    // Integer result times (sqrt(b) +/- c)
    if (rNum === 1) {
      answerExpr = `√${b} ${conjugateSign} ${c}`;
    } else {
      answerExpr = `${rNum}√${b} ${conjugateSign} ${rNum * c}`;
    }
  } else {
    if (rNum === 1) {
      answerExpr = `(√${b} ${conjugateSign} ${c})/${rDen}`;
    } else {
      answerExpr = `(${rNum}√${b} ${conjugateSign} ${rNum * c})/${rDen}`;
    }
  }

  return { expr, answerExpr };
};

/* ================================================================
   Expand mode
   ================================================================ */

const generateExpand = (rng: () => number): IrrationalCalcProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // (sqrt(a) + b)^2 = a + 2b*sqrt(a) + b^2
    return generateSquareExpand(rng);
  } else if (variant === 1) {
    // (sqrt(a) + sqrt(b))(sqrt(a) - sqrt(b)) = a - b
    return generateDifferenceOfSquares(rng);
  } else {
    // (sqrt(a) + b)(sqrt(a) + c) = a + (b+c)*sqrt(a) + bc
    return generateBinomialExpand(rng);
  }
};

const generateSquareExpand = (rng: () => number): IrrationalCalcProblem | null => {
  const bases = [2, 3, 5, 6, 7];
  const a = bases[Math.floor(rng() * bases.length)];
  const b = Math.floor(rng() * 7) + 1; // 1..7
  const subtract = rng() < 0.4;

  let expr: string;
  let constant: number;
  let rootCoeff: number;

  if (subtract) {
    expr = `(√${a} − ${b})²`;
    constant = a + b * b;
    rootCoeff = -2 * b;
  } else {
    expr = `(√${a} + ${b})²`;
    constant = a + b * b;
    rootCoeff = 2 * b;
  }

  const answerExpr = formatLinearRootExpr(constant, rootCoeff, a);
  return { expr, answerExpr };
};

const generateDifferenceOfSquares = (rng: () => number): IrrationalCalcProblem | null => {
  const bases = [2, 3, 5, 6, 7, 10, 11, 13];
  const a = bases[Math.floor(rng() * bases.length)];
  const bBases = bases.filter((x) => x !== a);
  const b = bBases[Math.floor(rng() * bBases.length)];

  const expr = `(√${a} + √${b})(√${a} − √${b})`;
  const result = a - b;
  const answerExpr = `${result}`;
  return { expr, answerExpr };
};

const generateBinomialExpand = (rng: () => number): IrrationalCalcProblem | null => {
  // (sqrt(a) + b)(sqrt(a) + c) = a + (b+c)*sqrt(a) + bc
  const bases = [2, 3, 5, 6, 7];
  const a = bases[Math.floor(rng() * bases.length)];
  const b = Math.floor(rng() * 9) - 4; // -4..4
  if (b === 0) return null;
  let c = Math.floor(rng() * 9) - 4;
  if (c === 0) return null;
  if (b === c) c = b + 1; // avoid identical terms (would be a square)
  if (c === 0) c = 1;

  const bStr = b >= 0 ? `√${a} + ${b}` : `√${a} − ${Math.abs(b)}`;
  const cStr = c >= 0 ? `√${a} + ${c}` : `√${a} − ${Math.abs(c)}`;
  const expr = `(${bStr})(${cStr})`;

  const constant = a + b * c;
  const rootCoeff = b + c;

  const answerExpr = formatLinearRootExpr(constant, rootCoeff, a);
  return { expr, answerExpr };
};

/* ================================================================
   Unicode formatting helpers
   ================================================================ */

/**
 * Format coeff * sqrt(base) as Unicode.
 * e.g. (2, 3) -> "2√3", (1, 5) -> "√5", (3, 1) -> "3"
 */
const formatRootUnicode = (coeff: number, base: number): string => {
  if (base === 1) return `${coeff}`;
  if (coeff === 1) return `√${base}`;
  if (coeff === -1) return `−√${base}`;
  if (coeff < 0) return `−${Math.abs(coeff)}√${base}`;
  return `${coeff}√${base}`;
};

/**
 * Format constant + rootCoeff*sqrt(base) as Unicode.
 * e.g. (7, 4, 3) -> "7 + 4√3"
 */
const formatLinearRootExpr = (constant: number, rootCoeff: number, base: number): string => {
  if (rootCoeff === 0) return `${constant}`;
  if (constant === 0) return formatRootUnicode(rootCoeff, base);

  const parts: string[] = [`${constant}`];

  if (rootCoeff > 0) {
    const rootStr = rootCoeff === 1 ? `√${base}` : `${rootCoeff}√${base}`;
    parts.push(`+ ${rootStr}`);
  } else {
    const absCoeff = Math.abs(rootCoeff);
    const rootStr = absCoeff === 1 ? `√${base}` : `${absCoeff}√${base}`;
    parts.push(`− ${rootStr}`);
  }

  return parts.join(" ");
};
