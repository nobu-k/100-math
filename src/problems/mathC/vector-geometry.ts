import { mulberry32 } from "../random";
import { gcd } from "../shared/math-utils";
import { simplifyRoot } from "../shared/latex-format";

export interface VectorGeometryProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateVectorGeometry = (
  seed: number,
  count = 10,
): VectorGeometryProblem[] => {
  const rng = mulberry32(seed);
  const problems: VectorGeometryProblem[] = [];
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

const generateOne = (rng: () => number): VectorGeometryProblem | null => {
  const variant = Math.floor(rng() * 4);

  if (variant === 0) return generateCentroid(rng);
  if (variant === 1) return generateInternalDivision(rng);
  if (variant === 2) return generate3dDot(rng);
  return generate3dDistance(rng);
};

const generateCentroid = (rng: () => number): VectorGeometryProblem | null => {
  const ax = Math.floor(rng() * 9) - 4;
  const ay = Math.floor(rng() * 9) - 4;
  const bx = Math.floor(rng() * 9) - 4;
  const by = Math.floor(rng() * 9) - 4;
  const cx = Math.floor(rng() * 9) - 4;
  const cy = Math.floor(rng() * 9) - 4;

  const sx = ax + bx + cx;
  const sy = ay + by + cy;
  if (sx % 3 !== 0 || sy % 3 !== 0) return null;

  const gx = sx / 3;
  const gy = sy / 3;

  const expr = `A(${fmt(ax)}, ${fmt(ay)}), B(${fmt(bx)}, ${fmt(by)}), C(${fmt(cx)}, ${fmt(cy)}) の重心 G の位置ベクトル`;
  const answerExpr = `G = (${fmt(gx)}, ${fmt(gy)})`;
  return { expr, answerExpr, isNL: true };
};

const generateInternalDivision = (rng: () => number): VectorGeometryProblem | null => {
  // P divides AB in ratio m:n → P = (nA + mB)/(m+n)
  const ax = Math.floor(rng() * 9) - 4;
  const ay = Math.floor(rng() * 9) - 4;
  const bx = Math.floor(rng() * 9) - 4;
  const by = Math.floor(rng() * 9) - 4;
  const m = Math.floor(rng() * 4) + 1;
  const n = Math.floor(rng() * 4) + 1;

  const px = n * ax + m * bx;
  const py = n * ay + m * by;
  const d = m + n;

  const pxStr = px % d === 0 ? `${px / d}` : fmtFrac(px, d);
  const pyStr = py % d === 0 ? `${py / d}` : fmtFrac(py, d);

  const expr = `A(${fmt(ax)}, ${fmt(ay)}), B(${fmt(bx)}, ${fmt(by)}) を ${m}:${n} に内分する点 P`;
  const answerExpr = `P(${pxStr}, ${pyStr})`;
  return { expr, answerExpr, isNL: true };
};

const generate3dDot = (rng: () => number): VectorGeometryProblem | null => {
  const a1 = Math.floor(rng() * 7) - 3;
  const a2 = Math.floor(rng() * 7) - 3;
  const a3 = Math.floor(rng() * 7) - 3;
  const b1 = Math.floor(rng() * 7) - 3;
  const b2 = Math.floor(rng() * 7) - 3;
  const b3 = Math.floor(rng() * 7) - 3;

  const dot = a1 * b1 + a2 * b2 + a3 * b3;

  const expr = `a⃗ = (${fmt(a1)}, ${fmt(a2)}, ${fmt(a3)}), b⃗ = (${fmt(b1)}, ${fmt(b2)}, ${fmt(b3)}) の内積 a⃗ · b⃗`;
  const answerExpr = `${fmt(dot)}`;
  return { expr, answerExpr, isNL: true };
};

const generate3dDistance = (rng: () => number): VectorGeometryProblem | null => {
  const x1 = Math.floor(rng() * 7) - 3;
  const y1 = Math.floor(rng() * 7) - 3;
  const z1 = Math.floor(rng() * 7) - 3;
  const x2 = Math.floor(rng() * 7) - 3;
  const y2 = Math.floor(rng() * 7) - 3;
  const z2 = Math.floor(rng() * 7) - 3;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const d2 = dx * dx + dy * dy + dz * dz;
  if (d2 === 0) return null;

  const [outer, inner] = simplifyRoot(d2);
  const distStr = inner === 1 ? `${outer}` : (outer === 1 ? `√${inner}` : `${outer}√${inner}`);

  const expr = `A(${fmt(x1)}, ${fmt(y1)}, ${fmt(z1)}) と B(${fmt(x2)}, ${fmt(y2)}, ${fmt(z2)}) の距離`;
  const answerExpr = distStr;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const fmtFrac = (num: number, den: number): string => {
  const sign = (num < 0) !== (den < 0) ? "−" : "";
  const an = Math.abs(num);
  const ad = Math.abs(den);
  const g = gcd(an, ad);
  return `${sign}${an / g}/${ad / g}`;
};
