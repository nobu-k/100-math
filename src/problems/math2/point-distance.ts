import { mulberry32 } from "../random";
import { simplifyRoot } from "../shared/latex-format";

export interface CoordProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generatePointDistance = (
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
  const x1 = Math.floor(rng() * 9) - 4;
  const y1 = Math.floor(rng() * 9) - 4;
  const x2 = Math.floor(rng() * 9) - 4;
  const y2 = Math.floor(rng() * 9) - 4;

  if (x1 === x2 && y1 === y2) return null;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const d2 = dx * dx + dy * dy;

  const [outer, inner] = simplifyRoot(d2);
  let distStr: string;
  if (inner === 1) distStr = `${outer}`;
  else if (outer === 1) distStr = `√${inner}`;
  else distStr = `${outer}√${inner}`;

  const expr = `2点 (${fmt(x1)}, ${fmt(y1)}), (${fmt(x2)}, ${fmt(y2)}) 間の距離`;
  const answerExpr = distStr;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;
