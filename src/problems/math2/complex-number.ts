import { mulberry32 } from "../random";

export type ComplexMode = "arithmetic" | "discriminant" | "vieta" | "factor-theorem" | "mixed";

export interface ComplexProblem {
  expr: string;
  answerExpr: string;
}

export const generateComplexNumber = (
  seed: number,
  mode: ComplexMode = "mixed",
  count = 10,
): ComplexProblem[] => {
  const rng = mulberry32(seed);
  const problems: ComplexProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: ComplexProblem | null = null;
      if (pick === "arithmetic") result = generateArithmetic(rng);
      else if (pick === "discriminant") result = generateDiscriminant(rng);
      else if (pick === "vieta") result = generateVieta(rng);
      else result = generateFactorTheorem(rng);

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

const pickMode = (rng: () => number, mode: ComplexMode): "arithmetic" | "discriminant" | "vieta" | "factor-theorem" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "arithmetic";
  if (r < 0.55) return "vieta";
  if (r < 0.75) return "discriminant";
  return "factor-theorem";
};

const generateArithmetic = (rng: () => number): ComplexProblem | null => {
  const variant = Math.floor(rng() * 4);
  const a = Math.floor(rng() * 7) - 3; // [-3..3]
  const b = Math.floor(rng() * 7) - 3;
  const c = Math.floor(rng() * 7) - 3;
  const d = Math.floor(rng() * 7) - 3;

  if (variant === 0) {
    // Addition
    const re = a + c;
    const im = b + d;
    const expr = `(${fmtComplex(a, b)}) + (${fmtComplex(c, d)})`;
    const answerExpr = fmtComplex(re, im);
    return { expr, answerExpr };
  }
  if (variant === 1) {
    // Multiplication: (a+bi)(c+di) = (ac-bd) + (ad+bc)i
    const re = a * c - b * d;
    const im = a * d + b * c;
    const expr = `(${fmtComplex(a, b)})(${fmtComplex(c, d)})`;
    const answerExpr = fmtComplex(re, im);
    return { expr, answerExpr };
  }
  if (variant === 2) {
    // Division: (a+bi)/(c+di) = ((ac+bd) + (bc-ad)i) / (c²+d²)
    if (c === 0 && d === 0) return null;
    const den = c * c + d * d;
    const numRe = a * c + b * d;
    const numIm = b * c - a * d;
    if (numRe % den !== 0 || numIm % den !== 0) return null;
    const re = numRe / den;
    const im = numIm / den;
    const expr = `(${fmtComplex(a, b)}) ÷ (${fmtComplex(c, d)})`;
    const answerExpr = fmtComplex(re, im);
    return { expr, answerExpr };
  }
  // i^n
  const n = Math.floor(rng() * 20) + 2; // [2..21]
  const mod = n % 4;
  const results = ["1", "i", "−1", "−i"];
  const expr = `i${superscript(n)}`;
  const answerExpr = results[mod];
  return { expr, answerExpr };
};

const generateDiscriminant = (rng: () => number): ComplexProblem | null => {
  // x² + bx + c = 0 with D < 0 → complex roots
  const b = Math.floor(rng() * 9) - 4; // [-4..4]
  const minC = Math.floor(b * b / 4) + 1;
  const c = minC + Math.floor(rng() * 5); // ensure D < 0

  const D = b * b - 4 * c;
  if (D >= 0) return null;

  const absD = -D;
  const [outer, inner] = simplifyRoot(absD);

  const rootPart = inner === 1
    ? (outer === 1 ? "" : `${outer}`)
    : (outer === 1 ? `√${inner}` : `${outer}√${inner}`);

  const halfB = -b;
  let answerExpr: string;
  if (halfB === 0) {
    answerExpr = rootPart ? `x = ±${rootPart}i/2` : "x = 0";
  } else {
    answerExpr = `x = (${halfB} ± ${rootPart}i)/2`;
  }

  const expr = `${formatQuadratic(1, b, c)} = 0`;
  return { expr, answerExpr };
};

const generateVieta = (rng: () => number): ComplexProblem | null => {
  // Given roots α, β of x² + bx + c = 0, find expressions
  const p = Math.floor(rng() * 9) - 4; // sum = -p → α+β = p
  const q = Math.floor(rng() * 9) - 4; // product = q → αβ = q

  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // α² + β² = (α+β)² - 2αβ
    const answer = p * p - 2 * q;
    const expr = `x² ${signTerm(-p)}x + ${q} = 0 の2解を α, β とするとき，α² + β² の値`;
    const answerExpr = `(α + β)² − 2αβ = ${p}² − 2·${q} = ${answer}`;
    return { expr, answerExpr };
  }
  if (variant === 1) {
    // 1/α + 1/β = (α+β)/(αβ)
    if (q === 0) return null;
    const g = gcd(Math.abs(p), Math.abs(q));
    const num = p / g;
    const den = q / g;
    const ansStr = den === 1 ? `${num}` : (den < 0 ? `${formatSigned(-num)}/${Math.abs(den)}` : `${formatSigned(num)}/${den}`);
    const expr = `x² ${signTerm(-p)}x + ${q} = 0 の2解を α, β とするとき，1/α + 1/β の値`;
    const answerExpr = `(α + β)/(αβ) = ${ansStr}`;
    return { expr, answerExpr };
  }
  // α³ + β³ = (α+β)³ - 3αβ(α+β)
  const answer = p * p * p - 3 * q * p;
  const expr = `x² ${signTerm(-p)}x + ${q} = 0 の2解を α, β とするとき，α³ + β³ の値`;
  const answerExpr = `${answer}`;
  return { expr, answerExpr };
};

const generateFactorTheorem = (rng: () => number): ComplexProblem | null => {
  // Factor x³ + ax² + bx + c given f(k) = 0
  const r1 = Math.floor(rng() * 7) - 3; // [-3..3] known root
  const r2 = Math.floor(rng() * 7) - 3;
  const r3 = Math.floor(rng() * 7) - 3;

  // x³ - (r1+r2+r3)x² + (r1r2+r1r3+r2r3)x - r1r2r3
  const a = -(r1 + r2 + r3);
  const b = r1 * r2 + r1 * r3 + r2 * r3;
  const c = -(r1 * r2 * r3);

  const expr = `f(x) = ${formatCubic(1, a, b, c)} のとき f(${formatSigned(r1)}) = 0 を利用して因数分解せよ`;

  // Factor: (x - r1)(x² + px + q) where p = -(r2+r3), q = r2*r3
  const p = -(r2 + r3);
  const q = r2 * r3;

  const factor1 = r1 >= 0 ? `(x − ${r1})` : `(x + ${Math.abs(r1)})`;
  const factor2 = `(${formatQuadratic(1, p, q)})`;

  const answerExpr = `${factor1}${factor2}`;
  return { expr, answerExpr };
};

/* ================================================================
   Formatting helpers
   ================================================================ */

const fmtComplex = (re: number, im: number): string => {
  if (re === 0 && im === 0) return "0";
  const parts: string[] = [];
  if (re !== 0) parts.push(`${re}`);
  if (im !== 0) {
    const absIm = Math.abs(im);
    const imStr = absIm === 1 ? "i" : `${absIm}i`;
    if (parts.length === 0) {
      parts.push(im < 0 ? `−${imStr}` : imStr);
    } else {
      parts.push(im > 0 ? `+ ${imStr}` : `− ${imStr}`);
    }
  }
  return parts.join(" ");
};

const formatQuadratic = (a: number, b: number, c: number): string => {
  const parts: string[] = [];
  if (a !== 0) {
    if (a === 1) parts.push("x²");
    else if (a === -1) parts.push("−x²");
    else parts.push(`${a}x²`);
  }
  appendLinear(parts, b);
  appendConst(parts, c);
  return parts.length === 0 ? "0" : parts.join(" ");
};

const formatCubic = (a: number, b: number, c: number, d: number): string => {
  const parts: string[] = [];
  if (a === 1) parts.push("x³");
  else if (a === -1) parts.push("−x³");
  else parts.push(`${a}x³`);
  appendTerm(parts, b, "x²");
  appendLinear(parts, c);
  appendConst(parts, d);
  return parts.join(" ");
};

const appendTerm = (parts: string[], coeff: number, v: string) => {
  if (coeff === 0) return;
  const abs = Math.abs(coeff);
  if (abs === 1) parts.push(coeff > 0 ? `+ ${v}` : `− ${v}`);
  else parts.push(coeff > 0 ? `+ ${abs}${v}` : `− ${abs}${v}`);
};

const appendLinear = (parts: string[], b: number) => {
  if (b === 0) return;
  const abs = Math.abs(b);
  if (parts.length === 0) {
    parts.push(abs === 1 ? (b < 0 ? "−x" : "x") : `${b}x`);
  } else {
    if (abs === 1) parts.push(b > 0 ? "+ x" : "− x");
    else parts.push(b > 0 ? `+ ${abs}x` : `− ${abs}x`);
  }
};

const appendConst = (parts: string[], c: number) => {
  if (c === 0) return;
  if (parts.length === 0) { parts.push(`${c}`); return; }
  parts.push(c > 0 ? `+ ${c}` : `− ${Math.abs(c)}`);
};

const signTerm = (n: number): string => {
  if (n === 0) return "";
  if (n === 1) return "+";
  if (n === -1) return "−";
  return n > 0 ? `+ ${n}` : `− ${Math.abs(n)}`;
};

const formatSigned = (n: number): string =>
  n < 0 ? `−${Math.abs(n)}` : `${n}`;

const superscript = (n: number): string => {
  const sup: Record<number, string> = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
  return sup[n] ?? `^${n}`;
};

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

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
