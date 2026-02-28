import { mulberry32 } from "../random";
import { gcd } from "../shared/math-utils";

export interface TrianglePropertiesProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateTriangleProperties = (
  seed: number,
  count = 10,
): TrianglePropertiesProblem[] => {
  const rng = mulberry32(seed);
  const problems: TrianglePropertiesProblem[] = [];
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

const generateOne = (rng: () => number): TrianglePropertiesProblem | null => {
  const variant = Math.floor(rng() * 4);

  if (variant === 0) return generateAngleBisector(rng);
  if (variant === 1) return generateMenelaus(rng);
  if (variant === 2) return generateCentroid(rng);
  return generateIncenter(rng);
};

const generateAngleBisector = (rng: () => number): TrianglePropertiesProblem | null => {
  // Angle bisector theorem: AD:DC = AB:BC = m:n
  const m = Math.floor(rng() * 5) + 2;
  const n = Math.floor(rng() * 5) + 2;
  if (m === n) return null;
  const g = gcd(m, n);
  const rm = m / g;
  const rn = n / g;

  const expr = `△ABC で ∠B の二等分線が AC と交わる点を D とする。AB = ${m}, BC = ${n} のとき，AD : DC`;
  const answerExpr = `AD : DC = ${rm} : ${rn}`;
  return { expr, answerExpr, isNL: true };
};

const generateMenelaus = (rng: () => number): TrianglePropertiesProblem | null => {
  // Menelaus' theorem: (BD/DC)(CE/EA)(AF/FB) = 1
  // Give 2 ratios, find the third
  const bd = Math.floor(rng() * 4) + 1;
  const dc = Math.floor(rng() * 4) + 1;
  const ce = Math.floor(rng() * 4) + 1;
  const ea = Math.floor(rng() * 4) + 1;
  // (BD/DC)(CE/EA)(AF/FB) = 1 → AF/FB = (DC·EA)/(BD·CE)
  const afNum = dc * ea;
  const afDen = bd * ce;
  const g = gcd(afNum, afDen);

  const expr = `メネラウスの定理：BD/DC = ${bd}/${dc}, CE/EA = ${ce}/${ea} のとき，AF/FB`;
  const answerExpr = `AF/FB = ${afNum / g}/${afDen / g}`;
  return { expr, answerExpr, isNL: true };
};

const generateCentroid = (rng: () => number): TrianglePropertiesProblem | null => {
  // Centroid G = (A+B+C)/3
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

  const expr = `A(${fmt(ax)}, ${fmt(ay)}), B(${fmt(bx)}, ${fmt(by)}), C(${fmt(cx)}, ${fmt(cy)}) の重心 G`;
  const answerExpr = `G(${fmt(gx)}, ${fmt(gy)})`;
  return { expr, answerExpr, isNL: true };
};

const generateIncenter = (rng: () => number): TrianglePropertiesProblem | null => {
  // Internal division point: P divides AB in ratio m:n → P = (nA + mB)/(m+n)
  const ax = Math.floor(rng() * 9) - 4;
  const ay = Math.floor(rng() * 9) - 4;
  const bx = Math.floor(rng() * 9) - 4;
  const by = Math.floor(rng() * 9) - 4;
  const m = Math.floor(rng() * 4) + 1;
  const n = Math.floor(rng() * 4) + 1;
  if (m === n && ax === bx) return null;

  const px = n * ax + m * bx;
  const py = n * ay + m * by;
  const d = m + n;
  const g1 = gcd(Math.abs(px), d);
  const g2 = gcd(Math.abs(py), d);

  const pxStr = px % d === 0 ? `${px / d}` : `${px / g1}/${d / g1}`;
  const pyStr = py % d === 0 ? `${py / d}` : `${py / g2}/${d / g2}`;

  const expr = `A(${fmt(ax)}, ${fmt(ay)}), B(${fmt(bx)}, ${fmt(by)}) を ${m} : ${n} に内分する点 P`;
  const answerExpr = `P(${pxStr}, ${pyStr})`;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;
