import { mulberry32 } from "../random";

export interface CoordProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateSectionPoint = (
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
  const m = Math.floor(rng() * 3) + 1;
  const n = Math.floor(rng() * 3) + 1;

  const total = m + n;
  const x1 = Math.floor(rng() * 7) - 3;
  const y1 = Math.floor(rng() * 7) - 3;

  const x2base = Math.floor(rng() * 7) - 3;
  let x2 = x2base;
  for (let d = 0; d <= total; d++) {
    if ((m * (x2base + d) + n * x1) % total === 0) { x2 = x2base + d; break; }
    if ((m * (x2base - d) + n * x1) % total === 0) { x2 = x2base - d; break; }
  }

  const y2base = Math.floor(rng() * 7) - 3;
  let y2 = y2base;
  for (let d = 0; d <= total; d++) {
    if ((m * (y2base + d) + n * y1) % total === 0) { y2 = y2base + d; break; }
    if ((m * (y2base - d) + n * y1) % total === 0) { y2 = y2base - d; break; }
  }

  if (x1 === x2 && y1 === y2) return null;

  const px = (m * x2 + n * x1) / total;
  const py = (m * y2 + n * y1) / total;

  const expr = `2点 (${fmt(x1)}, ${fmt(y1)}), (${fmt(x2)}, ${fmt(y2)}) を ${m}:${n} に内分する点`;
  const answerExpr = `(${fmt(px)}, ${fmt(py)})`;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;
