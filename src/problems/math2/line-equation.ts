import { mulberry32 } from "../random";

export interface CoordProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateLineEquation = (
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
  if (rng() < 0.5) {
    const x1 = Math.floor(rng() * 7) - 3;
    const y1 = Math.floor(rng() * 7) - 3;
    let x2 = Math.floor(rng() * 7) - 3;
    const y2 = Math.floor(rng() * 7) - 3;
    if (x1 === x2) x2 = x1 + 1;

    const dy = y2 - y1;
    const dx = x2 - x1;
    const g = gcd(Math.abs(dy), Math.abs(dx));
    let slopeNum = dy / g;
    let slopeDen = dx / g;
    if (slopeDen < 0) { slopeNum = -slopeNum; slopeDen = -slopeDen; }

    const expr = `2点 (${fmt(x1)}, ${fmt(y1)}), (${fmt(x2)}, ${fmt(y2)}) を通る直線の方程式`;

    if (slopeDen === 1) {
      const b = y1 - slopeNum * x1;
      const answerExpr = formatLinear(slopeNum, b);
      return { expr, answerExpr, isNL: true };
    }
    const slopeStr = `${fmt(slopeNum)}/${slopeDen}`;
    const b = y1 - (slopeNum / slopeDen) * x1;
    const bStr = Number.isInteger(b) ? (b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`) : "";
    const answerExpr = `y = (${slopeStr})x ${bStr}`;
    return { expr, answerExpr, isNL: true };
  }

  const slope = Math.floor(rng() * 7) - 3;
  const x0 = Math.floor(rng() * 7) - 3;
  const y0 = Math.floor(rng() * 7) - 3;

  const b = y0 - slope * x0;
  const expr = `点 (${fmt(x0)}, ${fmt(y0)}) を通り，傾き ${fmt(slope)} の直線の方程式`;
  const answerExpr = formatLinear(slope, b);
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const formatLinear = (m: number, b: number): string => {
  const mStr = m === 0 ? "" : m === 1 ? "x" : m === -1 ? "−x" : `${m}x`;
  if (m === 0) return `y = ${fmt(b)}`;
  if (b === 0) return `y = ${mStr}`;
  return b > 0 ? `y = ${mStr} + ${b}` : `y = ${mStr} − ${Math.abs(b)}`;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
