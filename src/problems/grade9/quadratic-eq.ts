import { mulberry32 } from "../random";

export type QuadEqMode = "factoring" | "formula" | "mixed";

export interface QuadEqProblem {
  /** Display equation */
  equation: string;
  /** Solutions */
  solutions: string[];
  /** Display answer */
  answerDisplay: string;
  type: "factoring" | "formula";
}

function formatQuadratic(a: number, b: number, c: number): string {
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
  return parts.join(" ");
}

function simplifyRoot(n: number): [number, number] {
  let outer = 1;
  let inner = n;
  for (let d = 2; d * d <= inner; d++) {
    while (inner % (d * d) === 0) {
      outer *= d;
      inner /= d * d;
    }
  }
  return [outer, inner];
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

export function generateQuadEq(
  seed: number,
  mode: QuadEqMode = "mixed",
): QuadEqProblem[] {
  const rng = mulberry32(seed);
  const problems: QuadEqProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const type =
        mode === "mixed"
          ? rng() < 0.6 ? "factoring" : "formula"
          : mode;

      let equation: string;
      let solutions: string[];
      let answerDisplay: string;

      if (type === "factoring") {
        const variant = Math.floor(rng() * 4);

        if (variant === 0) {
          // x² + bx + c = 0 → (x + p)(x + q) = 0
          let p = Math.floor(rng() * 17) - 8;
          let q = Math.floor(rng() * 17) - 8;
          if (p === 0) p = 1;
          if (q === 0) q = -1;
          // (x - p)(x - q) = 0 → x² - (p+q)x + pq = 0
          const bCoeff = -(p + q);
          const cCoeff = p * q;
          equation = `${formatQuadratic(1, bCoeff, cCoeff)} = 0`;
          if (p === q) {
            solutions = [`${p}`];
            answerDisplay = `x = ${p}`;
          } else {
            const s = [p, q].sort((a, b) => a - b);
            solutions = s.map(String);
            answerDisplay = `x = ${s[0]}, ${s[1]}`;
          }
        } else if (variant === 1) {
          // x² + bx = 0 → x(x + b) = 0
          let b = Math.floor(rng() * 13) - 6;
          if (b === 0) b = 1;
          equation = `${formatQuadratic(1, b, 0)} = 0`;
          const s = [0, -b].sort((a, b) => a - b);
          solutions = s.map(String);
          answerDisplay = `x = ${s[0]}, ${s[1]}`;
        } else if (variant === 2) {
          // x² - c = 0 → x = ±√c
          const c = Math.floor(rng() * 12) + 1; // 1-12
          const cSq = c * c;
          equation = `x² − ${cSq} = 0`;
          solutions = [`${c}`, `${-c}`];
          answerDisplay = `x = ±${c}`;
        } else {
          // x² = c (non-perfect square)
          const c = [2, 3, 5, 7, 8, 10, 11, 12, 13];
          const val = c[Math.floor(rng() * c.length)];
          equation = `x² = ${val}`;
          const [outer, inner] = simplifyRoot(val);
          if (outer === 1) {
            answerDisplay = `x = ±√${inner}`;
          } else {
            answerDisplay = `x = ±${outer}√${inner}`;
          }
          solutions = [answerDisplay];
        }
      } else {
        // Quadratic formula: ax² + bx + c = 0
        // x = (-b ± √(b²-4ac)) / 2a
        const a = 1; // keep simple with a=1 mostly
        const b = Math.floor(rng() * 13) - 6;
        const c = Math.floor(rng() * 11) - 5;
        if (c === 0) continue; // handled by factoring

        const disc = b * b - 4 * a * c;
        if (disc < 0) continue; // no real roots
        if (disc === 0) continue; // double root, handled by factoring

        // Check if discriminant is a perfect square (integer roots → factoring)
        const sqrtDisc = Math.sqrt(disc);
        if (sqrtDisc === Math.floor(sqrtDisc)) continue;

        equation = `${formatQuadratic(a, b, c)} = 0`;
        const [dOuter, dInner] = simplifyRoot(disc);
        const den = 2 * a;

        // Simplify: x = (-b ± dOuter√dInner) / den
        const g = gcd(gcd(Math.abs(b), dOuter), den);
        const sB = -b / g;
        const sD = dOuter / g;
        const sDen = den / g;

        if (sDen === 1) {
          const rootPart = sD === 1 ? `√${dInner}` : `${sD}√${dInner}`;
          answerDisplay = sB === 0
            ? `x = ±${rootPart}`
            : `x = ${sB} ± ${rootPart}`;
        } else {
          const rootPart = sD === 1 ? `√${dInner}` : `${sD}√${dInner}`;
          answerDisplay = sB === 0
            ? `x = ±${rootPart}/${sDen}`
            : `x = (${-b} ± ${dOuter === 1 ? "" : dOuter}√${dInner})/${den}`;
        }
        solutions = [answerDisplay];
      }

      const key = equation;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push({ equation, solutions, answerDisplay, type });
        break;
      }
    }
  }
  return problems;
}
