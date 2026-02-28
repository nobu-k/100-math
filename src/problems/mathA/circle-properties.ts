import { mulberry32 } from "../random";

export interface CirclePropertiesProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateCircleProperties = (
  seed: number,
  count = 10,
): CirclePropertiesProblem[] => {
  const rng = mulberry32(seed);
  const problems: CirclePropertiesProblem[] = [];
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

const generateOne = (rng: () => number): CirclePropertiesProblem | null => {
  const variant = Math.floor(rng() * 4);

  if (variant === 0) return generateInscribedAngle(rng);
  if (variant === 1) return generateCentralAngle(rng);
  if (variant === 2) return generatePowerOfPoint(rng);
  return generateTangentChord(rng);
};

const generateInscribedAngle = (rng: () => number): CirclePropertiesProblem | null => {
  // Inscribed angle = ½ central angle
  const central = (Math.floor(rng() * 8) + 2) * 10; // 20°–100°
  const inscribed = central / 2;

  const expr = `円に内接する四角形で，弧 AB に対する中心角が ${central}° のとき，弧 AB に対する円周角`;
  const answerExpr = `${central}° ÷ 2 = ${inscribed}°`;
  return { expr, answerExpr, isNL: true };
};

const generateCentralAngle = (rng: () => number): CirclePropertiesProblem | null => {
  // Given inscribed angle, find central angle
  const inscribed = (Math.floor(rng() * 8) + 2) * 5; // 10°–50°
  const central = inscribed * 2;

  const expr = `弧 AB に対する円周角が ${inscribed}° のとき，弧 AB に対する中心角`;
  const answerExpr = `${inscribed}° × 2 = ${central}°`;
  return { expr, answerExpr, isNL: true };
};

const generatePowerOfPoint = (rng: () => number): CirclePropertiesProblem | null => {
  // Power of a point: PA·PB = PC·PD
  const pa = Math.floor(rng() * 6) + 2;
  const pb = Math.floor(rng() * 6) + 2;
  const pc = Math.floor(rng() * 6) + 2;
  const product = pa * pb;
  if (product % pc !== 0) return null;
  const pd = product / pc;

  const expr = `方べきの定理：PA = ${pa}, PB = ${pb}, PC = ${pc} のとき，PD`;
  const answerExpr = `PA · PB = PC · PD より ${pa} × ${pb} = ${pc} × PD，PD = ${pd}`;
  return { expr, answerExpr, isNL: true };
};

const generateTangentChord = (rng: () => number): CirclePropertiesProblem | null => {
  // Tangent-chord angle = ½ arc
  const arc = (Math.floor(rng() * 8) + 2) * 10; // 20°–100° (half-arc)
  if (arc > 180) return null;
  const angle = arc / 2;

  const expr = `接線と弦のなす角：弧の大きさが ${arc}° のとき，接線と弦のなす角`;
  const answerExpr = `${arc}° ÷ 2 = ${angle}°`;
  return { expr, answerExpr, isNL: true };
};
