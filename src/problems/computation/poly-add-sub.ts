import { mulberry32 } from "../random";

export interface PolyAddSubProblem {
  /** Display expression */
  expr: string;
  /** Answer as formatted string, e.g. "8x − 2y + 6" */
  answerExpr: string;
  /** Individual coefficients for validation */
  coeffs: Record<string, number>;
}

export const generatePolyAddSub = (seed: number): PolyAddSubProblem[] => {
  const rng = mulberry32(seed);
  const problems: PolyAddSubProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const ax = Math.floor(rng() * 13) - 6;
      const ay = Math.floor(rng() * 13) - 6;
      const ac = Math.floor(rng() * 13) - 6;
      const bx = Math.floor(rng() * 13) - 6;
      const by = Math.floor(rng() * 13) - 6;
      const bc = Math.floor(rng() * 13) - 6;
      if (ax === 0 && ay === 0 && bx === 0 && by === 0) continue;

      const isSub = rng() < 0.5;
      const polyA = formatPoly(ax, ay, ac);
      const polyB = formatPoly(bx, by, bc);
      const expr = isSub
        ? `(${polyA}) − (${polyB})`
        : `(${polyA}) + (${polyB})`;

      const rx = isSub ? ax - bx : ax + bx;
      const ry = isSub ? ay - by : ay + by;
      const rc = isSub ? ac - bc : ac + bc;
      if (rx === 0 && ry === 0 && rc === 0) continue;

      const answerExpr = formatPoly(rx, ry, rc);
      const key = expr;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({
          expr,
          answerExpr,
          coeffs: { x: rx, y: ry, c: rc },
        });
        break;
      }
    }
  }
  return problems;
};

const formatPoly = (
  xCoeff: number,
  yCoeff: number,
  constant: number,
): string => {
  const parts: string[] = [];
  if (xCoeff !== 0) {
    if (xCoeff === 1) parts.push("x");
    else if (xCoeff === -1) parts.push("−x");
    else parts.push(`${xCoeff}x`);
  }
  if (yCoeff !== 0) {
    if (parts.length === 0) {
      if (yCoeff === 1) parts.push("y");
      else if (yCoeff === -1) parts.push("−y");
      else parts.push(`${yCoeff}y`);
    } else {
      if (yCoeff === 1) parts.push("+ y");
      else if (yCoeff === -1) parts.push("− y");
      else if (yCoeff > 0) parts.push(`+ ${yCoeff}y`);
      else parts.push(`− ${Math.abs(yCoeff)}y`);
    }
  }
  if (constant !== 0) {
    if (parts.length === 0) {
      parts.push(`${constant}`);
    } else if (constant > 0) {
      parts.push(`+ ${constant}`);
    } else {
      parts.push(`− ${Math.abs(constant)}`);
    }
  }
  if (parts.length === 0) return "0";
  return parts.join(" ");
};
