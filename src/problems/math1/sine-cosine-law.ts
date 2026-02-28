import { mulberry32 } from "../random";
import { STANDARD_ANGLES } from "../shared/trig-utils";

export type SineCosineLawMode = "sine-law" | "cosine-law" | "area" | "mixed";

export interface SineCosineLawProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateSineCosineLaw = (
  seed: number,
  mode: SineCosineLawMode = "mixed",
  count = 10,
): SineCosineLawProblem[] => {
  const rng = mulberry32(seed);
  const problems: SineCosineLawProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: SineCosineLawProblem | null = null;
      if (pick === "sine-law") result = generateSineLaw(rng);
      else if (pick === "cosine-law") result = generateCosineLaw(rng);
      else result = generateArea(rng);

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

const pickMode = (rng: () => number, mode: SineCosineLawMode): "sine-law" | "cosine-law" | "area" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "sine-law";
  if (r < 0.7) return "cosine-law";
  return "area";
};

// Angles with clean sine values for computation
const USABLE_ANGLES = STANDARD_ANGLES.filter(
  (a) => [30, 45, 60, 90, 120, 135, 150].includes(a.degrees),
);

const sinVal = (deg: number): number => {
  const map: Record<number, number> = {
    30: 0.5, 45: Math.SQRT2 / 2, 60: Math.sqrt(3) / 2,
    90: 1, 120: Math.sqrt(3) / 2, 135: Math.SQRT2 / 2, 150: 0.5,
  };
  return map[deg] ?? 0;
};

const cosVal = (deg: number): number => {
  const map: Record<number, number> = {
    30: Math.sqrt(3) / 2, 45: Math.SQRT2 / 2, 60: 0.5,
    90: 0, 120: -0.5, 135: -Math.SQRT2 / 2, 150: -Math.sqrt(3) / 2,
  };
  return map[deg] ?? 0;
};

const sinLabel = (deg: number): string => {
  const map: Record<number, string> = {
    30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1",
    120: "√3/2", 135: "√2/2", 150: "1/2",
  };
  return map[deg] ?? `sin ${deg}°`;
};


const generateSineLaw = (rng: () => number): SineCosineLawProblem | null => {
  // a/sinA = 2R. Given a and A, find R
  const angle = USABLE_ANGLES[Math.floor(rng() * USABLE_ANGLES.length)];
  if (angle.degrees === 90) {
    // Special case: sinA = 1, so 2R = a → R = a/2
    const a = (Math.floor(rng() * 5) + 1) * 2;
    const R = a / 2;
    const expr = `△ABC で a = ${a}, A = 90° のとき，外接円の半径 R`;
    const answerExpr = `2R = ${a}/sin 90° = ${a}，R = ${R}`;
    return { expr, answerExpr, isNL: true };
  }

  const a = Math.floor(rng() * 8) + 2;
  const deg = angle.degrees;
  const sv = sinVal(deg);
  const twoR = a / sv;
  const twoRStr = Number.isInteger(twoR) ? `${twoR}` : `${a}/(${sinLabel(deg)})`;

  const expr = `△ABC で a = ${a}, A = ${deg}° のとき，外接円の半径 R`;
  const answerExpr = `2R = ${a}/sin ${deg}° = ${twoRStr}`;
  return { expr, answerExpr, isNL: true };
};

const generateCosineLaw = (rng: () => number): SineCosineLawProblem | null => {
  // c² = a² + b² − 2ab·cosC
  const angles = USABLE_ANGLES.filter((a) => [60, 90, 120].includes(a.degrees));
  const angle = angles[Math.floor(rng() * angles.length)];
  const deg = angle.degrees;
  const a = Math.floor(rng() * 6) + 2;
  const b = Math.floor(rng() * 6) + 2;
  const cv = cosVal(deg);
  const c2 = a * a + b * b - 2 * a * b * cv;
  if (c2 <= 0) return null;

  const c2Int = Math.round(c2);
  const cExact = Math.sqrt(c2Int);
  const cStr = Number.isInteger(cExact) ? `${cExact}` : `√${c2Int}`;

  const expr = `△ABC で a = ${a}, b = ${b}, C = ${deg}° のとき，c`;
  const answerExpr = `c² = ${a}² + ${b}² − 2·${a}·${b}·cos ${deg}° = ${c2Int}，c = ${cStr}`;
  return { expr, answerExpr, isNL: true };
};

const generateArea = (rng: () => number): SineCosineLawProblem | null => {
  // S = ½ab·sinC
  const angles = USABLE_ANGLES.filter((a) => [30, 45, 60, 90, 120].includes(a.degrees));
  const angle = angles[Math.floor(rng() * angles.length)];
  const deg = angle.degrees;
  const a = Math.floor(rng() * 6) + 2;
  const b = Math.floor(rng() * 6) + 2;
  const sv = sinVal(deg);
  const area = 0.5 * a * b * sv;
  const areaStr = Number.isInteger(area) ? `${area}` : `${a}·${b}·${sinLabel(deg)}/2`;

  const expr = `△ABC で a = ${a}, b = ${b}, C = ${deg}° のとき，面積 S`;
  const answerExpr = `S = ${a}·${b}·sin ${deg}°/2 = ${areaStr}`;
  return { expr, answerExpr, isNL: true };
};
