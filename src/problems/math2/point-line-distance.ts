import { mulberry32 } from "../random";
import { simplifyRoot } from "../shared/latex-format";

export interface CoordProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generatePointLineDistance = (
  seed: number,
  count = 10,
): CoordProblem[] => {
  const rng = mulberry32(seed);
  const problems: CoordProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = generateOne(rng);
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

const generateOne = (rng: () => number): CoordProblem | null => {
  const a = Math.floor(rng() * 5) + 1;
  const b = Math.floor(rng() * 5) + 1;
  const c = Math.floor(rng() * 11) - 5;
  const x0 = Math.floor(rng() * 7) - 3;
  const y0 = Math.floor(rng() * 7) - 3;

  const num = Math.abs(a * x0 + b * y0 + c);
  const den2 = a * a + b * b;

  const [outer, inner] = simplifyRoot(den2);

  let distStr: string;
  if (inner === 1) {
    const g = gcd(num, outer);
    if (outer / g === 1) {
      distStr = `${num / g}`;
    } else {
      distStr = `${num / g}/${outer / g}`;
    }
  } else if (num === 0) {
    distStr = "0";
  } else {
    const rationalDen = outer * inner;
    const g = gcd(num, rationalDen);
    const rn = num / g;
    const rd = rationalDen / g;
    if (rd === 1) {
      distStr = rn === 1 ? `√${inner}` : `${rn}√${inner}`;
    } else {
      distStr = rn === 1 ? `√${inner}/${rd}` : `${rn}√${inner}/${rd}`;
    }
  }

  const lineStr = formatLineStd(a, b, c);
  const expr = `点 (${fmt(x0)}, ${fmt(y0)}) と直線 ${lineStr} の距離`;
  const answerExpr = distStr;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const formatLineStd = (a: number, b: number, c: number): string => {
  const parts: string[] = [];
  if (a === 1) parts.push("x");
  else parts.push(`${a}x`);
  if (b === 1) parts.push("+ y");
  else if (b === -1) parts.push("− y");
  else if (b > 0) parts.push(`+ ${b}y`);
  else parts.push(`− ${Math.abs(b)}y`);
  if (c > 0) parts.push(`+ ${c}`);
  else if (c < 0) parts.push(`− ${Math.abs(c)}`);
  return `${parts.join(" ")} = 0`;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
