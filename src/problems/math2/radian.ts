import { mulberry32 } from "../random";

export type RadianMode = "convert" | "arc-sector" | "mixed";

export interface RadianProblem {
  expr: string;
  answerExpr: string;
}

export const generateRadian = (
  seed: number,
  mode: RadianMode = "mixed",
  count = 12,
): RadianProblem[] => {
  const rng = mulberry32(seed);
  const problems: RadianProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = mode === "mixed"
        ? rng() < 0.6 ? "convert" : "arc-sector"
        : mode;

      const result = pick === "convert"
        ? generateConvert(rng)
        : generateArcSector(rng);

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

const generateConvert = (rng: () => number): RadianProblem | null => {
  const angles = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
  const deg = angles[Math.floor(rng() * angles.length)];

  if (rng() < 0.5) {
    // Degrees → radians
    const rad = degToRadianStr(deg);
    const expr = `${deg}° を弧度法で表せ`;
    const answerExpr = rad;
    return { expr, answerExpr };
  }
  // Radians → degrees
  const rad = degToRadianStr(deg);
  const expr = `${rad} を度数法で表せ`;
  const answerExpr = `${deg}°`;
  return { expr, answerExpr };
};

const generateArcSector = (rng: () => number): RadianProblem | null => {
  const r = Math.floor(rng() * 8) + 2; // [2..9]
  // Pick theta as a nice fraction of pi
  const numChoices = [1, 2, 3, 4, 5, 6];
  const denChoices = [2, 3, 4, 6];
  const num = numChoices[Math.floor(rng() * numChoices.length)];
  const den = denChoices[Math.floor(rng() * denChoices.length)];
  if (num >= 2 * den) return null; // theta must be < 2π

  const g = gcd(num, den);
  const rNum = num / g;
  const rDen = den / g;

  const thetaStr = rDen === 1
    ? (rNum === 1 ? "π" : `${rNum}π`)
    : (rNum === 1 ? `π/${rDen}` : `${rNum}π/${rDen}`);

  if (rng() < 0.5) {
    // Arc length: l = rθ
    const arcG = gcd(r * num, den);
    const arcNum = r * num / arcG;
    const arcDen = den / arcG;
    const arcStr = arcDen === 1
      ? (arcNum === 1 ? "π" : `${arcNum}π`)
      : (arcNum === 1 ? `π/${arcDen}` : `${arcNum}π/${arcDen}`);

    const expr = `半径 ${r}，中心角 ${thetaStr} の弧の長さ`;
    const answerExpr = `l = ${r} × ${thetaStr} = ${arcStr}`;
    return { expr, answerExpr };
  }

  // Sector area: S = (1/2)r²θ
  const areaNum = r * r * num;
  const areaDen = 2 * den;
  const areaG = gcd(areaNum, areaDen);
  const aN = areaNum / areaG;
  const aD = areaDen / areaG;
  const areaStr = aD === 1
    ? (aN === 1 ? "π" : `${aN}π`)
    : (aN === 1 ? `π/${aD}` : `${aN}π/${aD}`);

  const expr = `半径 ${r}，中心角 ${thetaStr} の扇形の面積`;
  const answerExpr = `S = (1/2) × ${r}² × ${thetaStr} = ${areaStr}`;
  return { expr, answerExpr };
};

const degToRadianStr = (deg: number): string => {
  const g = gcd(deg, 180);
  const num = deg / g;
  const den = 180 / g;
  if (den === 1) return num === 1 ? "π" : `${num}π`;
  if (num === 1) return `π/${den}`;
  return `${num}π/${den}`;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
