import { mulberry32 } from "../random";
import { STANDARD_ANGLES } from "../shared/trig-utils";

export interface ParametricPolarProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateParametricPolar = (
  seed: number,
  count = 10,
): ParametricPolarProblem[] => {
  const rng = mulberry32(seed);
  const problems: ParametricPolarProblem[] = [];
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

const generateOne = (rng: () => number): ParametricPolarProblem | null => {
  const variant = Math.floor(rng() * 4);

  if (variant === 0) return generateCartesianToPolar(rng);
  if (variant === 1) return generatePolarToCartesian(rng);
  if (variant === 2) return generateParametricEliminate(rng);
  return generatePolarEquation(rng);
};

// Standard angles suitable for polar coordinate conversions
const POLAR_ANGLES = STANDARD_ANGLES.filter(
  (a) => [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330].includes(a.degrees),
);

const cosVal = (deg: number): number => {
  const map: Record<number, number> = {
    0: 1, 30: Math.sqrt(3) / 2, 45: Math.SQRT2 / 2, 60: 0.5, 90: 0,
    120: -0.5, 135: -Math.SQRT2 / 2, 150: -Math.sqrt(3) / 2, 180: -1,
    210: -Math.sqrt(3) / 2, 225: -Math.SQRT2 / 2, 240: -0.5, 270: 0,
    300: 0.5, 315: Math.SQRT2 / 2, 330: Math.sqrt(3) / 2,
  };
  return map[deg] ?? Math.cos(deg * Math.PI / 180);
};

const sinVal = (deg: number): number => {
  const map: Record<number, number> = {
    0: 0, 30: 0.5, 45: Math.SQRT2 / 2, 60: Math.sqrt(3) / 2, 90: 1,
    120: Math.sqrt(3) / 2, 135: Math.SQRT2 / 2, 150: 0.5, 180: 0,
    210: -0.5, 225: -Math.SQRT2 / 2, 240: -Math.sqrt(3) / 2, 270: -1,
    300: -Math.sqrt(3) / 2, 315: -Math.SQRT2 / 2, 330: -0.5,
  };
  return map[deg] ?? Math.sin(deg * Math.PI / 180);
};

const generateCartesianToPolar = (rng: () => number): ParametricPolarProblem | null => {
  // Simple cases: axis-aligned points for clean r and θ
  const angle = POLAR_ANGLES[Math.floor(rng() * POLAR_ANGLES.length)];
  const r = Math.floor(rng() * 4) + 1;
  const x = r * cosVal(angle.degrees);
  const y = r * sinVal(angle.degrees);

  if (!isClean(x) || !isClean(y)) return null;

  const xStr = fmtClean(x);
  const yStr = fmtClean(y);

  const expr = `直交座標 (${xStr}, ${yStr}) を極座標に変換せよ`;
  const answerExpr = `(r, θ) = (${r}, ${angle.degrees}°)`;
  return { expr, answerExpr, isNL: true };
};

const generatePolarToCartesian = (rng: () => number): ParametricPolarProblem | null => {
  const angle = POLAR_ANGLES.filter((a) => [0, 30, 45, 60, 90, 120, 150, 180].includes(a.degrees));
  const entry = angle[Math.floor(rng() * angle.length)];
  const r = Math.floor(rng() * 4) + 1;

  const x = r * cosVal(entry.degrees);
  const y = r * sinVal(entry.degrees);

  const xStr = fmtClean(x);
  const yStr = fmtClean(y);

  const expr = `極座標 (${r}, ${entry.degrees}°) を直交座標に変換せよ`;
  const answerExpr = `(x, y) = (${xStr}, ${yStr})`;
  return { expr, answerExpr, isNL: true };
};

const generateParametricEliminate = (rng: () => number): ParametricPolarProblem | null => {
  // x = at + b, y = ct + d → eliminate t
  const a = Math.floor(rng() * 5) + 1;
  const b = Math.floor(rng() * 7) - 3;
  const c = Math.floor(rng() * 5) + 1;
  const d = Math.floor(rng() * 7) - 3;
  if (a === c) return null;

  // t = (x - b)/a → y = c(x-b)/a + d
  const xStr = b === 0 ? `${a}t` : `${a}t ${b > 0 ? `+ ${b}` : `− ${-b}`}`;
  const yStr = d === 0 ? `${c}t` : `${c}t ${d > 0 ? `+ ${d}` : `− ${-d}`}`;

  const slope = `${c}/${a}`;

  const expr = `x = ${xStr}, y = ${yStr} から t を消去せよ`;
  const answerExpr = `y = (${slope})(x − ${fmt(b)}) + ${fmt(d)}`;
  return { expr, answerExpr, isNL: true };
};

const generatePolarEquation = (rng: () => number): ParametricPolarProblem | null => {
  // r = 2a·cosθ → circle x² + y² = 2ax → (x−a)² + y² = a²
  const a = Math.floor(rng() * 4) + 1;
  const twoA = 2 * a;

  const expr = `極方程式 r = ${twoA} cos θ はどのような曲線か`;
  const answerExpr = `中心 (${a}, 0)，半径 ${a} の円`;
  return { expr, answerExpr, isNL: true };
};

const isClean = (n: number): boolean => {
  if (Number.isInteger(n)) return true;
  // Check if it's a simple irrational like k√2, k√3
  return false;
};

const fmtClean = (n: number): string => {
  if (Number.isInteger(n)) return fmt(n);
  const rounded = Math.round(n * 1000) / 1000;
  return `${rounded}`;
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;
