import { mulberry32 } from "../random";

export interface RegionIneqProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateRegionIneq = (
  seed: number,
  count = 10,
): RegionIneqProblem[] => {
  const rng = mulberry32(seed);
  const problems: RegionIneqProblem[] = [];
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

const generateOne = (rng: () => number): RegionIneqProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) return generatePointMembership(rng);
  if (variant === 1) return generateLinearProgramming(rng);
  return generateCircleRegion(rng);
};

const generatePointMembership = (rng: () => number): RegionIneqProblem | null => {
  // Check if point (px, py) satisfies y > ax + b
  const a = Math.floor(rng() * 5) - 2;
  const b = Math.floor(rng() * 7) - 3;
  const px = Math.floor(rng() * 7) - 3;
  const py = Math.floor(rng() * 7) - 3;

  const rhs = a * px + b;
  const satisfies = py > rhs;
  const ineqStr = a === 0 ? `y > ${fmt(b)}` :
    (b === 0 ? `y > ${fmtCoeff(a)}x` : `y > ${fmtCoeff(a)}x ${b > 0 ? `+ ${b}` : `− ${-b}`}`);

  const expr = `点 (${fmt(px)}, ${fmt(py)}) は ${ineqStr} を満たすか`;
  const answerExpr = `${fmt(py)} ${satisfies ? ">" : "≤"} ${fmt(rhs)} → ${satisfies ? "満たす" : "満たさない"}`;
  return { expr, answerExpr, isNL: true };
};

const generateLinearProgramming = (rng: () => number): RegionIneqProblem | null => {
  // Maximize/minimize ax + by subject to x ≥ 0, y ≥ 0, px + qy ≤ c
  const p = Math.floor(rng() * 3) + 1;
  const q = Math.floor(rng() * 3) + 1;
  const c = (Math.floor(rng() * 4) + 2) * p * q; // ensure clean division
  const objA = Math.floor(rng() * 4) + 1;
  const objB = Math.floor(rng() * 4) + 1;

  // Vertices: (0,0), (c/p, 0), (0, c/q)
  const v1 = 0; // at origin
  const v2 = objA * (c / p); // at (c/p, 0)
  const v3 = objB * (c / q); // at (0, c/q)
  const maxVal = Math.max(v1, v2, v3);

  if (!Number.isInteger(c / p) || !Number.isInteger(c / q)) return null;

  const expr = `x ≥ 0, y ≥ 0, ${fmtCoeff(p)}x + ${fmtCoeff(q)}y ≤ ${c} のとき，${fmtCoeff(objA)}x + ${fmtCoeff(objB)}y の最大値`;
  const answerExpr = `${maxVal}`;
  return { expr, answerExpr, isNL: true };
};

const generateCircleRegion = (rng: () => number): RegionIneqProblem | null => {
  // Point inside/outside circle x²+y²≤r²
  const r = Math.floor(rng() * 4) + 2;
  const px = Math.floor(rng() * 7) - 3;
  const py = Math.floor(rng() * 7) - 3;
  const dist2 = px * px + py * py;
  const r2 = r * r;
  const inside = dist2 <= r2;

  const expr = `点 (${fmt(px)}, ${fmt(py)}) は x² + y² ≤ ${r2} を満たすか`;
  const answerExpr = `${px}² + ${py}² = ${dist2} ${inside ? "≤" : ">"} ${r2} → ${inside ? "満たす" : "満たさない"}`;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const fmtCoeff = (n: number): string => {
  if (n === 1) return "";
  if (n === -1) return "−";
  return fmt(n);
};
