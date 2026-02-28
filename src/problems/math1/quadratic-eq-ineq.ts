import { mulberry32 } from "../random";

export type QuadraticEqIneqMode = "equation" | "inequality" | "discriminant" | "mixed";

export interface QuadraticEqIneqProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateQuadraticEqIneq = (
  seed: number,
  mode: QuadraticEqIneqMode = "mixed",
  count = 10,
): QuadraticEqIneqProblem[] => {
  const rng = mulberry32(seed);
  const problems: QuadraticEqIneqProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: QuadraticEqIneqProblem | null = null;
      if (pick === "equation") result = generateEquation(rng);
      else if (pick === "inequality") result = generateInequality(rng);
      else result = generateDiscriminant(rng);

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
  mode: QuadraticEqIneqMode,
): "equation" | "inequality" | "discriminant" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.4) return "equation";
  if (r < 0.75) return "inequality";
  return "discriminant";
};

/* ================================================================
   Equation mode: non-monic quadratics (ax+b)(cx+d)=0
   and irrational roots via quadratic formula
   ================================================================ */

const generateEquation = (rng: () => number): QuadraticEqIneqProblem | null => {
  const variant = rng();

  if (variant < 0.6) {
    return generateRationalEquation(rng);
  }
  return generateIrrationalEquation(rng);
};

const generateRationalEquation = (rng: () => number): QuadraticEqIneqProblem | null => {
  // (ax + b)(cx + d) = 0, roots are -b/a and -d/c
  const a = Math.floor(rng() * 3) + 1; // [1..3]
  const c = Math.floor(rng() * 3) + 1; // [1..3]
  let b = Math.floor(rng() * 11) - 5;  // [-5..5]
  if (b === 0) b = 1;
  let d = Math.floor(rng() * 11) - 5;  // [-5..5]
  if (d === 0) d = -1;

  // Expanded: (ax+b)(cx+d) = acx² + (ad+bc)x + bd
  const A = a * c;
  const B = a * d + b * c;
  const C = b * d;

  const expr = `${formatQuadratic(A, B, C)} = 0`;

  // Roots: x = -b/a, x = -d/c
  const roots = [formatFraction(-b, a), formatFraction(-d, c)];
  const uniqueRoots = [...new Set(roots)];

  // Sort roots numerically
  const sortedRoots = uniqueRoots
    .map((r) => ({ str: r, val: evalFraction(r) }))
    .sort((x, y) => x.val - y.val)
    .map((r) => r.str);

  const answerExpr = `x = ${sortedRoots.join(", ")}`;
  return { expr, answerExpr, isNL: true };
};

const generateIrrationalEquation = (rng: () => number): QuadraticEqIneqProblem | null => {
  // ax² + bx + c = 0 with irrational roots
  const a = 1;
  const b = Math.floor(rng() * 11) - 5; // [-5..5]
  const c = Math.floor(rng() * 11) - 5; // [-5..5]
  if (c === 0) return null;

  const disc = b * b - 4 * a * c;
  if (disc <= 0) return null;

  // Skip perfect-square discriminants (those give rational roots)
  const sqrtDisc = Math.sqrt(disc);
  if (sqrtDisc === Math.floor(sqrtDisc)) return null;

  const expr = `${formatQuadratic(a, b, c)} = 0`;

  const [dOuter, dInner] = simplifyRoot(disc);
  const den = 2 * a;

  // x = (-b ± dOuter√dInner) / den
  const g = gcd(gcd(Math.abs(b), dOuter), den);
  const sB = -b / g;
  const sD = dOuter / g;
  const sDen = den / g;

  let answerExpr: string;
  if (sDen === 1) {
    const rootPart = sD === 1 ? `√${dInner}` : `${sD}√${dInner}`;
    answerExpr = sB === 0
      ? `x = ±${rootPart}`
      : `x = ${sB} ± ${rootPart}`;
  } else {
    const rootPart = sD === 1 ? `√${dInner}` : `${sD}√${dInner}`;
    answerExpr = sB === 0
      ? `x = ±${rootPart}/${sDen}`
      : `x = (${-b} ± ${dOuter === 1 ? "" : dOuter}√${dInner})/${den}`;
  }

  return { expr, answerExpr, isNL: true };
};

/* ================================================================
   Inequality mode: quadratic inequalities with integer roots
   ================================================================ */

const generateInequality = (rng: () => number): QuadraticEqIneqProblem | null => {
  // Generate from known roots r1 < r2
  let r1 = Math.floor(rng() * 9) - 4; // [-4..4]
  let r2 = Math.floor(rng() * 9) - 4; // [-4..4]
  if (r1 === r2) r2 = r1 + 1;
  if (r1 > r2) [r1, r2] = [r2, r1];

  const a = 1; // keep monic for simplicity
  // (x - r1)(x - r2) = x² - (r1+r2)x + r1*r2
  const B = -(r1 + r2);
  const C = r1 * r2;

  // Pick inequality type: >, <, >=, <=
  const ineqTypes = [">", "<", "≥", "≤"] as const;
  const ineq = ineqTypes[Math.floor(rng() * ineqTypes.length)];

  const expr = `${formatQuadratic(a, B, C)} ${ineq} 0`;

  const answerExpr = formatInequalityAnswer(r1, r2, ineq);

  return { expr, answerExpr, isNL: true };
};

const formatInequalityAnswer = (
  r1: number,
  r2: number,
  ineq: ">" | "<" | "≥" | "≤",
): string => {
  const s1 = formatSigned(r1);
  const s2 = formatSigned(r2);

  // For a > 0 (monic), (x-r1)(x-r2):
  // > 0 → x < r1 or x > r2
  // < 0 → r1 < x < r2
  // ≥ 0 → x ≤ r1 or x ≥ r2
  // ≤ 0 → r1 ≤ x ≤ r2
  switch (ineq) {
    case ">":
      return `x < ${s1}, ${s2} < x`;
    case "<":
      return `${s1} < x < ${s2}`;
    case "≥":
      return `x ≤ ${s1}, ${s2} ≤ x`;
    case "≤":
      return `${s1} ≤ x ≤ ${s2}`;
  }
};

/* ================================================================
   Discriminant mode: classify solutions
   ================================================================ */

const generateDiscriminant = (rng: () => number): QuadraticEqIneqProblem | null => {
  const a = Math.floor(rng() * 3) + 1; // [1..3]
  const b = Math.floor(rng() * 13) - 6; // [-6..6]
  const c = Math.floor(rng() * 13) - 6; // [-6..6]
  if (a === 0) return null;

  const D = b * b - 4 * a * c;

  const expr = `${formatQuadratic(a, b, c)} = 0 の判別式 D の値と解の種類`;

  let classification: string;
  if (D > 0) classification = "異なる2つの実数解";
  else if (D === 0) classification = "重解";
  else classification = "実数解なし";

  const answerExpr = `D = ${formatSigned(D)}，${classification}`;

  return { expr, answerExpr, isNL: true };
};

/* ================================================================
   Formatting helpers
   ================================================================ */

/** Format ax² + bx + c as Unicode string */
const formatQuadratic = (a: number, b: number, c: number): string => {
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

  if (parts.length === 0) return "0";
  return parts.join(" ");
};

/** Format a fraction -n/d in simplest form */
const formatFraction = (num: number, den: number): string => {
  const g = gcd(Math.abs(num), Math.abs(den));
  const n = num / g;
  const d = den / g;
  if (d === 1) return formatSigned(n);
  if (n < 0 && d > 0) return `−${Math.abs(n)}/${d}`;
  if (n > 0 && d < 0) return `−${n}/${Math.abs(d)}`;
  if (n < 0 && d < 0) return `${Math.abs(n)}/${Math.abs(d)}`;
  return `${n}/${d}`;
};

/** Evaluate a formatted fraction string to a number (for sorting) */
const evalFraction = (s: string): number => {
  const cleaned = s.replace(/−/g, "-");
  if (cleaned.includes("/")) {
    const [num, den] = cleaned.split("/").map(Number);
    return num / den;
  }
  return Number(cleaned);
};

/** Format a number for display, showing negative sign with − */
const formatSigned = (n: number): string => {
  if (n < 0) return `−${Math.abs(n)}`;
  return `${n}`;
};

/** Simplify √n into outer√inner */
const simplifyRoot = (n: number): [number, number] => {
  let outer = 1;
  let inner = n;
  for (let d = 2; d * d <= inner; d++) {
    while (inner % (d * d) === 0) {
      outer *= d;
      inner /= d * d;
    }
  }
  return [outer, inner];
};

/** Greatest common divisor */
const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
