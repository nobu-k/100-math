import { mulberry32 } from "../random";

export type LinearInequalityMode = "single" | "system" | "mixed";

export interface LinearInequalityProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateLinearInequality = (
  seed: number,
  mode: LinearInequalityMode = "mixed",
  count = 10,
): LinearInequalityProblem[] => {
  const rng = mulberry32(seed);
  const problems: LinearInequalityProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      const result = pick === "single"
        ? generateSingle(rng)
        : generateSystem(rng);

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
  mode: LinearInequalityMode,
): "single" | "system" => {
  if (mode !== "mixed") return mode;
  return rng() < 0.6 ? "single" : "system";
};

/* ================================================================
   Single inequality
   ================================================================ */

const INEQ_SIGNS = [">", "<", "≥", "≤"] as const;

const generateSingle = (rng: () => number): LinearInequalityProblem | null => {
  const variant = rng();
  if (variant < 0.35) return generateAxPlusBCmpC(rng);
  if (variant < 0.7) return generateBothSides(rng);
  return generateFractionForm(rng);
};

/** ax + b > c  (simple form) */
const generateAxPlusBCmpC = (rng: () => number): LinearInequalityProblem | null => {
  const a = randNonZero(rng, -5, 5);
  const b = randInt(rng, -8, 8);
  const c = randInt(rng, -8, 8);
  const sign = pickSign(rng);

  // Solve: ax + b [sign] c  =>  ax [sign'] c - b  =>  x [sign''] (c-b)/a
  const diff = c - b;
  if (diff % a !== 0) return null;
  const solution = diff / a;
  if (Math.abs(solution) > 20) return null;

  const answerSign = a < 0 ? flipSign(sign) : sign;
  const expr = `${fmtCoeffX(a)} ${fmtPlusTerm(b)} ${sign} ${c}`;
  const answerExpr = `x ${answerSign} ${fmtNum(solution)}`;

  return { expr, answerExpr };
};

/** ax + b > cx + d  (variable on both sides) */
const generateBothSides = (rng: () => number): LinearInequalityProblem | null => {
  const a = randNonZero(rng, -5, 5);
  let c = randNonZero(rng, -5, 5);
  if (a === c) c = c > 0 ? c - 1 : c + 1;
  if (c === 0) c = 1;
  const b = randInt(rng, -8, 8);
  const d = randInt(rng, -8, 8);
  const sign = pickSign(rng);

  // Solve: ax + b [sign] cx + d  =>  (a-c)x [sign] d - b  =>  x [sign'] (d-b)/(a-c)
  const coeffDiff = a - c;
  if (coeffDiff === 0) return null;
  const constDiff = d - b;
  if (constDiff % coeffDiff !== 0) return null;
  const solution = constDiff / coeffDiff;
  if (Math.abs(solution) > 20) return null;

  const answerSign = coeffDiff < 0 ? flipSign(sign) : sign;
  const lhs = `${fmtCoeffX(a)} ${fmtPlusTerm(b)}`;
  const rhs = `${fmtCoeffX(c)} ${fmtPlusTerm(d)}`;
  const expr = `${lhs} ${sign} ${rhs}`;
  const answerExpr = `x ${answerSign} ${fmtNum(solution)}`;

  return { expr, answerExpr };
};

/** (x + a) / b > c  (fraction form) */
const generateFractionForm = (rng: () => number): LinearInequalityProblem | null => {
  const b = randNonZero(rng, -4, 4);
  if (Math.abs(b) === 1) return null; // trivial
  const a = randInt(rng, -6, 6);
  const c = randInt(rng, -5, 5);
  const sign = pickSign(rng);

  // Solve: (x + a)/b [sign] c  =>  x + a [sign'] b*c  =>  x [sign'] b*c - a
  const solution = b * c - a;
  if (Math.abs(solution) > 20) return null;

  const answerSign = b < 0 ? flipSign(sign) : sign;
  const inner = a >= 0 ? `x + ${a}` : `x − ${Math.abs(a)}`;
  const expr = `(${inner}) / ${Math.abs(b) === b ? b : `(${b})`} ${sign} ${c}`;
  const answerExpr = `x ${answerSign} ${fmtNum(solution)}`;

  return { expr, answerExpr };
};

/* ================================================================
   System of inequalities
   ================================================================ */

const generateSystem = (rng: () => number): LinearInequalityProblem | null => {
  const variant = rng();
  if (variant < 0.5) return generateTwoInequalities(rng);
  return generateCompound(rng);
};

/** Two inequalities joined by かつ: "ax+b>c かつ dx+e≤f" */
const generateTwoInequalities = (rng: () => number): LinearInequalityProblem | null => {
  // Generate two single-variable inequalities that yield a bounded interval
  const a1 = randNonZero(rng, 1, 4);
  const b1 = randInt(rng, -6, 6);
  const c1 = randInt(rng, -6, 6);

  const diff1 = c1 - b1;
  if (diff1 % a1 !== 0) return null;
  const bound1 = diff1 / a1; // x > bound1 or x ≥ bound1

  const a2 = randNonZero(rng, 1, 4);
  const b2 = randInt(rng, -6, 6);
  const c2 = randInt(rng, -6, 6);

  const diff2 = c2 - b2;
  if (diff2 % a2 !== 0) return null;
  const bound2 = diff2 / a2; // x < bound2 or x ≤ bound2

  if (bound1 >= bound2) return null; // no valid interval
  if (Math.abs(bound1) > 15 || Math.abs(bound2) > 15) return null;

  // Pick whether bounds are strict or non-strict
  const strict1 = rng() < 0.5;
  const strict2 = rng() < 0.5;
  const sign1 = strict1 ? ">" : "≥";
  const sign2 = strict2 ? "<" : "≤";

  const expr1 = `${fmtCoeffX(a1)} ${fmtPlusTerm(b1)} ${sign1} ${c1}`;
  const expr2 = `${fmtCoeffX(a2)} ${fmtPlusTerm(b2)} ${sign2} ${c2}`;
  const expr = `${expr1} かつ ${expr2}`;

  const leftSign = strict1 ? "<" : "≤";
  const rightSign = strict2 ? "<" : "≤";
  const answerExpr = `${fmtNum(bound1)} ${leftSign} x ${rightSign} ${fmtNum(bound2)}`;

  return { expr, answerExpr, isNL: true };
};

/** Compound form: a < bx + c < d */
const generateCompound = (rng: () => number): LinearInequalityProblem | null => {
  const b = randNonZero(rng, 1, 4);
  const c = randInt(rng, -5, 5);

  // Pick two distinct boundary values for x
  const lo = randInt(rng, -5, 3);
  const hi = lo + Math.floor(rng() * 5) + 1; // ensure hi > lo
  if (Math.abs(hi) > 10) return null;

  // Compute a = b*lo + c, d = b*hi + c
  const a = b * lo + c;
  const d = b * hi + c;
  if (Math.abs(a) > 15 || Math.abs(d) > 15) return null;

  const expr = `${a} < ${fmtCoeffX(b)} ${fmtPlusTerm(c)} < ${d}`;
  const answerExpr = `${fmtNum(lo)} < x < ${fmtNum(hi)}`;

  return { expr, answerExpr };
};

/* ================================================================
   Formatting helpers
   ================================================================ */

const randInt = (rng: () => number, lo: number, hi: number): number =>
  Math.floor(rng() * (hi - lo + 1)) + lo;

const randNonZero = (rng: () => number, lo: number, hi: number): number => {
  for (let i = 0; i < 20; i++) {
    const v = randInt(rng, lo, hi);
    if (v !== 0) return v;
  }
  return 1;
};

const pickSign = (rng: () => number): string =>
  INEQ_SIGNS[Math.floor(rng() * INEQ_SIGNS.length)];

const flipSign = (sign: string): string => {
  if (sign === ">") return "<";
  if (sign === "<") return ">";
  if (sign === "≥") return "≤";
  if (sign === "≤") return "≥";
  return sign;
};

/** Format coefficient * x: 1 -> "x", -1 -> "−x", n -> "nx" */
const fmtCoeffX = (coeff: number): string => {
  if (coeff === 1) return "x";
  if (coeff === -1) return "−x";
  return `${fmtNum(coeff)}x`;
};

/** Format a constant as a plus/minus continuation term: " + 3" or " − 3" */
const fmtPlusTerm = (val: number): string => {
  if (val === 0) return "";
  if (val > 0) return `+ ${val}`;
  return `− ${Math.abs(val)}`;
};

/** Format a number using Unicode minus for negatives */
const fmtNum = (n: number): string => (n < 0 ? `−${Math.abs(n)}` : `${n}`);
