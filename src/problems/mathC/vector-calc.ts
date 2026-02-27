import { mulberry32 } from "../random";
import { simplifyRoot } from "../shared/latex-format";

export type VectorCalcMode = "operations" | "inner-product" | "angle" | "mixed";

export interface VectorCalcProblem {
  expr: string;
  answerExpr: string;
}

export const generateVectorCalc = (
  seed: number,
  mode: VectorCalcMode = "mixed",
  count = 10,
): VectorCalcProblem[] => {
  const rng = mulberry32(seed);
  const problems: VectorCalcProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: VectorCalcProblem | null = null;
      if (pick === "operations") result = generateOperations(rng);
      else if (pick === "inner-product") result = generateInnerProduct(rng);
      else result = generateAngle(rng);

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

const pickMode = (rng: () => number, mode: VectorCalcMode): "operations" | "inner-product" | "angle" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "operations";
  if (r < 0.65) return "inner-product";
  return "angle";
};

const generateOperations = (rng: () => number): VectorCalcProblem | null => {
  const a1 = Math.floor(rng() * 9) - 4;
  const a2 = Math.floor(rng() * 9) - 4;
  const b1 = Math.floor(rng() * 9) - 4;
  const b2 = Math.floor(rng() * 9) - 4;

  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // a⃗ + b⃗
    const r1 = a1 + b1;
    const r2 = a2 + b2;
    const expr = `a⃗ = (${fmt(a1)}, ${fmt(a2)}), b⃗ = (${fmt(b1)}, ${fmt(b2)}) のとき，a⃗ + b⃗`;
    const answerExpr = `(${fmt(r1)}, ${fmt(r2)})`;
    return { expr, answerExpr };
  }

  if (variant === 1) {
    // a⃗ − b⃗
    const r1 = a1 - b1;
    const r2 = a2 - b2;
    const expr = `a⃗ = (${fmt(a1)}, ${fmt(a2)}), b⃗ = (${fmt(b1)}, ${fmt(b2)}) のとき，a⃗ − b⃗`;
    const answerExpr = `(${fmt(r1)}, ${fmt(r2)})`;
    return { expr, answerExpr };
  }

  // |a⃗| magnitude
  const mag2 = a1 * a1 + a2 * a2;
  if (mag2 === 0) return null;
  const [outer, inner] = simplifyRoot(mag2);
  const magStr = inner === 1 ? `${outer}` : (outer === 1 ? `√${inner}` : `${outer}√${inner}`);

  const expr = `a⃗ = (${fmt(a1)}, ${fmt(a2)}) のとき，|a⃗|`;
  const answerExpr = magStr;
  return { expr, answerExpr };
};

const generateInnerProduct = (rng: () => number): VectorCalcProblem | null => {
  const a1 = Math.floor(rng() * 7) - 3;
  const a2 = Math.floor(rng() * 7) - 3;
  const b1 = Math.floor(rng() * 7) - 3;
  const b2 = Math.floor(rng() * 7) - 3;

  const dot = a1 * b1 + a2 * b2;

  const expr = `a⃗ = (${fmt(a1)}, ${fmt(a2)}), b⃗ = (${fmt(b1)}, ${fmt(b2)}) のとき，a⃗ · b⃗`;
  const answerExpr = `${fmt(a1)} × ${fmt(b1)} + ${fmt(a2)} × ${fmt(b2)} = ${fmt(dot)}`;
  return { expr, answerExpr };
};

const generateAngle = (rng: () => number): VectorCalcProblem | null => {
  // Find angle between vectors via cosθ = (a⃗·b⃗)/(|a⃗||b⃗|)
  // Use vectors that give standard angles
  const pairs: [number, number, number, number, string][] = [
    [1, 0, 0, 1, "90°"],     // perpendicular
    [1, 0, 1, 1, "45°"],     // 45 degrees
    [1, 0, 1, 0, "0°"],      // parallel
    [1, 1, -1, 1, "90°"],    // perpendicular
    [2, 0, 1, 1, "45°"],     // cos45 = 2/(2√2)
    [1, 0, -1, 0, "180°"],   // anti-parallel
  ];

  const [a1, a2, b1, b2, angle] = pairs[Math.floor(rng() * pairs.length)];
  const dot = a1 * b1 + a2 * b2;

  const mag2A = a1 * a1 + a2 * a2;
  const mag2B = b1 * b1 + b2 * b2;

  const [outerA, innerA] = simplifyRoot(mag2A);
  const [outerB, innerB] = simplifyRoot(mag2B);

  const magAStr = innerA === 1 ? `${outerA}` : (outerA === 1 ? `√${innerA}` : `${outerA}√${innerA}`);
  const magBStr = innerB === 1 ? `${outerB}` : (outerB === 1 ? `√${innerB}` : `${outerB}√${innerB}`);

  const expr = `a⃗ = (${fmt(a1)}, ${fmt(a2)}), b⃗ = (${fmt(b1)}, ${fmt(b2)}) のなす角 θ`;
  const answerExpr = `cos θ = ${fmt(dot)}/(${magAStr} × ${magBStr})，θ = ${angle}`;
  return { expr, answerExpr };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;
