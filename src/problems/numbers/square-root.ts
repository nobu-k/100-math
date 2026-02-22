import { mulberry32 } from "../random";

export type SqrtMode = "find" | "simplify" | "mul-div" | "add-sub" | "rationalize" | "mixed";

export interface SqrtProblem {
  type: SqrtMode;
  expr: string;
  answerDisplay: string;
}

export const generateSqrt = (
  seed: number,
  mode: SqrtMode = "mixed",
): SqrtProblem[] => {
  const rng = mulberry32(seed);
  const problems: SqrtProblem[] = [];
  const seen = new Set<string>();

  const modes: SqrtMode[] =
    mode === "mixed"
      ? ["find", "simplify", "mul-div", "add-sub", "rationalize"]
      : [mode];

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const type = modes[Math.floor(rng() * modes.length)];
      let expr: string;
      let answerDisplay: string;

      if (type === "find") {
        const perfectSquares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
        const n = perfectSquares[Math.floor(rng() * perfectSquares.length)];
        const root = Math.sqrt(n);
        const variant = rng();
        if (variant < 0.4) {
          expr = `√${n}`;
          answerDisplay = `${root}`;
        } else if (variant < 0.7) {
          expr = `${n} の平方根`;
          answerDisplay = `±${root}`;
        } else {
          // negative square
          expr = `(−${root})² の平方根`;
          answerDisplay = `±${root}`;
        }
      } else if (type === "simplify") {
        // √n where n has perfect square factors
        const bases = [2, 3, 5, 6, 7];
        const base = bases[Math.floor(rng() * bases.length)];
        const multiplier = 2 + Math.floor(rng() * 4); // 2-5
        const n = multiplier * multiplier * base;
        if (n > 300) continue;

        const variant = rng() < 0.7;
        if (variant) {
          expr = `√${n}`;
          answerDisplay = fmtRoot(multiplier, base);
        } else {
          // Reverse: a√b → √n
          expr = `${fmtRoot(multiplier, base)} を √□ の形に`;
          answerDisplay = `√${n}`;
        }
      } else if (type === "mul-div") {
        const isMul = rng() < 0.6;
        if (isMul) {
          const a = 2 + Math.floor(rng() * 10); // 2-11
          const b = 2 + Math.floor(rng() * 10);
          const product = a * b;
          const [outer, inner] = simplifyRoot(product);
          expr = `√${a} × √${b}`;
          answerDisplay = fmtRoot(outer, inner);
          // Also handle coefficient cases
        } else {
          const b = 2 + Math.floor(rng() * 8); // 2-9
          const quotientBase = 2 + Math.floor(rng() * 6);
          const a = quotientBase * b; // ensure divisible
          if (a > 200) continue;
          const q = a / b;
          const [outer, inner] = simplifyRoot(q);
          expr = `√${a} ÷ √${b}`;
          answerDisplay = fmtRoot(outer, inner);
        }
      } else if (type === "add-sub") {
        // a√n ± b√n = (a±b)√n
        const bases = [2, 3, 5, 6, 7];
        const base = bases[Math.floor(rng() * bases.length)];

        // Generate terms that simplify to the same √base
        const coeff1 = 1 + Math.floor(rng() * 5);
        const coeff2 = 1 + Math.floor(rng() * 5);
        const isSub = rng() < 0.5;

        // Some problems need simplification first
        const needsSimplify = rng() < 0.5;
        if (needsSimplify) {
          // e.g. √12 + √27 = 2√3 + 3√3 = 5√3
          const n1 = coeff1 * coeff1 * base;
          const n2 = coeff2 * coeff2 * base;
          if (n1 > 200 || n2 > 200) continue;
          expr = isSub ? `√${n1} − √${n2}` : `√${n1} + √${n2}`;
          const resultCoeff = isSub ? coeff1 - coeff2 : coeff1 + coeff2;
          if (resultCoeff === 0) {
            answerDisplay = "0";
          } else {
            answerDisplay = fmtRoot(resultCoeff, base);
          }
        } else {
          expr = isSub
            ? `${coeff1}√${base} − ${coeff2}√${base}`
            : `${coeff1}√${base} + ${coeff2}√${base}`;
          const resultCoeff = isSub ? coeff1 - coeff2 : coeff1 + coeff2;
          if (resultCoeff === 0) {
            answerDisplay = "0";
          } else {
            answerDisplay = fmtRoot(resultCoeff, base);
          }
        }
      } else {
        // rationalize: a/√b
        const bases = [2, 3, 5, 6, 7];
        const base = bases[Math.floor(rng() * bases.length)];
        const num = 1 + Math.floor(rng() * 8); // 1-8

        expr = `${num}/√${base}`;
        // a/√b = a√b / b
        const g = gcd(num, base);
        const rNum = num / g;
        const rDen = base / g;
        if (rDen === 1) {
          answerDisplay = fmtRoot(rNum, base);
        } else {
          answerDisplay = `${rNum === 1 ? "" : rNum}√${base}/${base}`;
        }
      }

      const key = expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push({ type, expr, answerDisplay });
        break;
      }
    }
  }
  return problems;
};

/**
 * Simplify √n to a√b form where b has no perfect square factors.
 * Returns [a, b] such that √n = a√b.
 */
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

const fmtRoot = (outer: number, inner: number): string => {
  if (inner === 1) return `${outer}`;
  if (outer === 1) return `√${inner}`;
  return `${outer}√${inner}`;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
