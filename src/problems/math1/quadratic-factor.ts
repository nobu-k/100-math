import { mulberry32 } from "../random";
import { formatPoly, polyMul, type Poly } from "../shared/poly-utils";

export type QuadraticFactorMode = "expand" | "factor" | "mixed";

export interface QuadraticFactorProblem {
  expr: string;
  answerExpr: string;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export const generateQuadraticFactor = (
  seed: number,
  mode: QuadraticFactorMode = "mixed",
  count = 12,
): QuadraticFactorProblem[] => {
  const rng = mulberry32(seed);
  const problems: QuadraticFactorProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick =
        mode === "mixed"
          ? rng() < 0.5 ? "expand" : "factor"
          : mode;

      const problem = pick === "expand"
        ? generateExpandProblem(rng)
        : generateFactorProblem(rng);

      if (!problem) continue;

      const key = problem.expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push(problem);
        break;
      }
    }
  }
  return problems;
};

/* ------------------------------------------------------------------ */
/*  Expand problems                                                   */
/* ------------------------------------------------------------------ */

const generateExpandProblem = (
  rng: () => number,
): QuadraticFactorProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) return generateNonMonicExpand(rng);
  if (variant === 1) return generateTwoVarExpand(rng);
  return generateQuarticExpand(rng);
};

/** (ax+b)(cx+d) non-monic expansion */
const generateNonMonicExpand = (
  rng: () => number,
): QuadraticFactorProblem | null => {
  const a = Math.floor(rng() * 4) + 1; // 1..4
  const b = randNonZero(rng, -5, 5);
  const c = Math.floor(rng() * 4) + 1; // 1..4
  const d = randNonZero(rng, -5, 5);

  // Ensure non-monic: at least one leading coeff > 1
  if (a === 1 && c === 1) return null;
  // Each factor must be coprime so the expression is irreducible
  if (gcd(a, Math.abs(b)) !== 1 || gcd(c, Math.abs(d)) !== 1) return null;

  const expr = `(${fmtLinear(a, b)})(${fmtLinear(c, d)})`;
  const product: Poly = polyMul([b, a], [d, c]); // [b+a*x] * [d+c*x]
  const answerExpr = formatPoly(product);
  return { expr, answerExpr };
};

/** (ax+by)² or (ax−by)² two-variable expansion */
const generateTwoVarExpand = (
  rng: () => number,
): QuadraticFactorProblem | null => {
  const a = Math.floor(rng() * 3) + 1; // 1..3
  const b = randNonZero(rng, -3, 3);
  const absB = Math.abs(b);

  const sign = b > 0 ? "+" : "−";
  const ax = a === 1 ? "x" : `${a}x`;
  const by = absB === 1 ? "y" : `${absB}y`;
  const expr = `(${ax} ${sign} ${by})²`;

  // (ax ± by)² = a²x² ± 2ab·xy + b²y²
  const a2 = a * a;
  const twoAB = 2 * a * b; // signed
  const b2 = b * b;
  const answerExpr = fmtTwoVarQuadratic(a2, twoAB, b2);
  return { expr, answerExpr };
};

/** (x²+a)(x²+b) quartic-from-quadratic expansion */
const generateQuarticExpand = (
  rng: () => number,
): QuadraticFactorProblem => {
  const a = randNonZero(rng, -5, 5);
  const b = randNonZero(rng, -5, 5);

  const inner1 = fmtTermPlusSigned("x²", a);
  const inner2 = fmtTermPlusSigned("x²", b);
  const expr = `(${inner1})(${inner2})`;

  // (x²+a)(x²+b) = x⁴ + (a+b)x² + ab
  const answerExpr = fmtQuartic(1, a + b, a * b);
  return { expr, answerExpr };
};

/* ------------------------------------------------------------------ */
/*  Factor problems                                                   */
/* ------------------------------------------------------------------ */

const generateFactorProblem = (
  rng: () => number,
): QuadraticFactorProblem | null => {
  const variant = Math.floor(rng() * 4);

  if (variant === 0) return generateNonMonicFactor(rng);
  if (variant === 1) return generateNonMonicDiffOfSquares(rng);
  if (variant === 2) return generateCommonFactorFirst(rng);
  return generateTwoVarFactor(rng);
};

/** Non-monic factoring: 6x²+7x−3 → (2x+3)(3x−1) */
const generateNonMonicFactor = (
  rng: () => number,
): QuadraticFactorProblem | null => {
  const a = Math.floor(rng() * 4) + 1; // 1..4
  const b = randNonZero(rng, -5, 5);
  const c = Math.floor(rng() * 4) + 1; // 1..4
  const d = randNonZero(rng, -5, 5);

  // Ensure non-monic
  if (a === 1 && c === 1) return null;
  // Each factor must be coprime so the factored form is fully reduced
  if (gcd(a, Math.abs(b)) !== 1 || gcd(c, Math.abs(d)) !== 1) return null;

  const product: Poly = polyMul([b, a], [d, c]);
  const expr = formatPoly(product);

  // Canonical answer: put the factor with larger leading coeff first
  const [f1, f2] = canonicalFactorOrder(a, b, c, d);
  const answerExpr = `(${fmtLinear(f1[0], f1[1])})(${fmtLinear(f2[0], f2[1])})`;
  return { expr, answerExpr };
};

/** Non-monic difference of squares: 4x²−9 → (2x+3)(2x−3) */
const generateNonMonicDiffOfSquares = (
  rng: () => number,
): QuadraticFactorProblem | null => {
  const a = Math.floor(rng() * 4) + 1; // 1..4 (coefficient of x)
  const b = Math.floor(rng() * 5) + 1; // 1..5 (constant)

  // Ensure coprime so the factored form is fully reduced
  if (gcd(a, b) !== 1) return null;

  const a2 = a * a;
  const b2 = b * b;
  const expr = fmtQuadraticSingle(a2, 0, -b2);

  const ax = a === 1 ? "x" : `${a}x`;
  const answerExpr = `(${ax} + ${b})(${ax} − ${b})`;
  return { expr, answerExpr };
};

/** Common factor first: 2x²+6x+4 → 2(x+1)(x+2) */
const generateCommonFactorFirst = (
  rng: () => number,
): QuadraticFactorProblem | null => {
  const k = Math.floor(rng() * 4) + 2; // 2..5 common factor
  // Inner monic quadratic: (x+p)(x+q)
  let p = randNonZero(rng, -6, 6);
  let q = randNonZero(rng, -6, 6);
  if (p === q && p > 0) q = -q; // avoid perfect square to keep it interesting

  const inner: Poly = polyMul([p, 1], [q, 1]); // (x+p)(x+q)
  const scaled = inner.map((c) => c * k);

  const expr = formatPoly(scaled);

  // Answer: k(x+p)(x+q) — order p,q so that p ≤ q
  const [lo, hi] = p <= q ? [p, q] : [q, p];
  const factor1 = fmtMonicFactor(lo);
  const factor2 = fmtMonicFactor(hi);

  if (lo === hi) {
    // perfect square: k(x+a)²
    const answerExpr = `${k}(${factor1})²`;
    return { expr, answerExpr };
  }

  const answerExpr = `${k}(${factor1})(${factor2})`;
  return { expr, answerExpr };
};

/** Two-variable factoring: a²−2ab+b² → (a−b)² */
const generateTwoVarFactor = (
  rng: () => number,
): QuadraticFactorProblem => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // a² + 2ab + b² = (a + b)²
    const expr = "a² + 2ab + b²";
    const answerExpr = "(a + b)²";
    return { expr, answerExpr };
  } else if (variant === 1) {
    // a² − 2ab + b² = (a − b)²
    const expr = "a² − 2ab + b²";
    const answerExpr = "(a − b)²";
    return { expr, answerExpr };
  } else {
    // a² − b² = (a + b)(a − b)
    const expr = "a² − b²";
    const answerExpr = "(a + b)(a − b)";
    return { expr, answerExpr };
  }
};

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                */
/* ------------------------------------------------------------------ */

/** Format ax+b as a binomial string */
const fmtLinear = (coeff: number, constant: number): string => {
  const parts: string[] = [];
  if (coeff === 1) parts.push("x");
  else if (coeff === -1) parts.push("−x");
  else parts.push(`${coeff}x`);

  if (constant > 0) parts.push(`+ ${constant}`);
  else if (constant < 0) parts.push(`− ${Math.abs(constant)}`);
  return parts.join(" ");
};

/** Format "term + n" or "term − n" */
const fmtTermPlusSigned = (term: string, n: number): string => {
  if (n > 0) return `${term} + ${n}`;
  if (n < 0) return `${term} − ${Math.abs(n)}`;
  return term;
};

/** Format a·x² + b·xy + c·y² (two-variable quadratic) */
const fmtTwoVarQuadratic = (a: number, b: number, c: number): string => {
  const parts: string[] = [];

  // x² term
  if (a !== 0) {
    if (a === 1) parts.push("x²");
    else parts.push(`${a}x²`);
  }

  // xy term
  if (b !== 0) {
    const absB = Math.abs(b);
    if (parts.length === 0) {
      if (b === 1) parts.push("xy");
      else if (b === -1) parts.push("−xy");
      else parts.push(`${b}xy`);
    } else {
      if (b === 1) parts.push("+ xy");
      else if (b === -1) parts.push("− xy");
      else if (b > 0) parts.push(`+ ${absB}xy`);
      else parts.push(`− ${absB}xy`);
    }
  }

  // y² term
  if (c !== 0) {
    const absC = Math.abs(c);
    if (parts.length === 0) {
      if (c === 1) parts.push("y²");
      else parts.push(`${c}y²`);
    } else {
      if (c === 1) parts.push("+ y²");
      else if (c === -1) parts.push("− y²");
      else if (c > 0) parts.push(`+ ${absC}y²`);
      else parts.push(`− ${absC}y²`);
    }
  }

  return parts.length === 0 ? "0" : parts.join(" ");
};

/** Format x⁴ + b·x² + c (quartic in x² pattern) */
const fmtQuartic = (a: number, b: number, c: number): string => {
  const parts: string[] = [];

  // x⁴ term
  if (a !== 0) {
    if (a === 1) parts.push("x⁴");
    else if (a === -1) parts.push("−x⁴");
    else parts.push(`${a}x⁴`);
  }

  // x² term
  if (b !== 0) {
    const absB = Math.abs(b);
    if (parts.length === 0) {
      if (b === 1) parts.push("x²");
      else if (b === -1) parts.push("−x²");
      else parts.push(`${b}x²`);
    } else {
      if (b === 1) parts.push("+ x²");
      else if (b === -1) parts.push("− x²");
      else if (b > 0) parts.push(`+ ${absB}x²`);
      else parts.push(`− ${absB}x²`);
    }
  }

  // constant term
  if (c !== 0) {
    if (parts.length === 0) {
      parts.push(`${c}`);
    } else if (c > 0) {
      parts.push(`+ ${c}`);
    } else {
      parts.push(`− ${Math.abs(c)}`);
    }
  }

  return parts.length === 0 ? "0" : parts.join(" ");
};

/** Format ax² + bx + c (single variable quadratic) */
const fmtQuadraticSingle = (a: number, b: number, c: number): string => {
  const parts: string[] = [];

  if (a !== 0) {
    if (a === 1) parts.push("x²");
    else if (a === -1) parts.push("−x²");
    else parts.push(`${a}x²`);
  }
  if (b !== 0) {
    if (parts.length === 0) {
      if (b === 1) parts.push("x");
      else if (b === -1) parts.push("−x");
      else parts.push(`${b}x`);
    } else {
      if (b === 1) parts.push("+ x");
      else if (b === -1) parts.push("− x");
      else if (b > 0) parts.push(`+ ${b}x`);
      else parts.push(`− ${Math.abs(b)}x`);
    }
  }
  if (c !== 0) {
    if (parts.length === 0) parts.push(`${c}`);
    else if (c > 0) parts.push(`+ ${c}`);
    else parts.push(`− ${Math.abs(c)}`);
  }
  return parts.length === 0 ? "0" : parts.join(" ");
};

/** Format (x + n) or (x − n) for monic factors */
const fmtMonicFactor = (n: number): string => {
  if (n === 0) return "x";
  if (n > 0) return `x + ${n}`;
  return `x − ${Math.abs(n)}`;
};

/** Order two factors (a,b) and (c,d) canonically: larger leading coeff first */
const canonicalFactorOrder = (
  a: number, b: number, c: number, d: number,
): [[number, number], [number, number]] => {
  if (a > c) return [[a, b], [c, d]];
  if (c > a) return [[c, d], [a, b]];
  // Same leading coeff — put larger constant first
  if (b >= d) return [[a, b], [c, d]];
  return [[c, d], [a, b]];
};

/* ------------------------------------------------------------------ */
/*  Utility                                                           */
/* ------------------------------------------------------------------ */

/** Random non-zero integer in [lo..hi] */
const randNonZero = (rng: () => number, lo: number, hi: number): number => {
  for (let i = 0; i < 20; i++) {
    const v = Math.floor(rng() * (hi - lo + 1)) + lo;
    if (v !== 0) return v;
  }
  return 1; // fallback
};

/** Greatest common divisor (Euclidean algorithm) */
const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
};
