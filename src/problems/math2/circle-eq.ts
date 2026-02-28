import { mulberry32 } from "../random";

export type CircleEqMode = "standard" | "general" | "intersection" | "mixed";

export interface CircleEqProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateCircleEq = (
  seed: number,
  mode: CircleEqMode = "mixed",
  count = 10,
): CircleEqProblem[] => {
  const rng = mulberry32(seed);
  const problems: CircleEqProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: CircleEqProblem | null = null;
      if (pick === "standard") result = generateStandard(rng);
      else if (pick === "general") result = generateGeneral(rng);
      else result = generateIntersection(rng);

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

const pickMode = (rng: () => number, mode: CircleEqMode): "standard" | "general" | "intersection" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "standard";
  if (r < 0.7) return "general";
  return "intersection";
};

const generateStandard = (rng: () => number): CircleEqProblem | null => {
  // Center (a,b), radius r → equation
  const a = Math.floor(rng() * 9) - 4;
  const b = Math.floor(rng() * 9) - 4;
  const r = Math.floor(rng() * 5) + 1;

  const xPart = a === 0 ? "x" : `(x ${a > 0 ? `− ${a}` : `+ ${-a}`})`;
  const yPart = b === 0 ? "y" : `(y ${b > 0 ? `− ${b}` : `+ ${-b}`})`;

  const expr = `中心 (${fmt(a)}, ${fmt(b)})，半径 ${r} の円の方程式`;
  const answerExpr = `${xPart}² + ${yPart}² = ${r * r}`;
  return { expr, answerExpr, isNL: true };
};

const generateGeneral = (rng: () => number): CircleEqProblem | null => {
  // x² + y² + Dx + Ey + F = 0 → center and radius
  const a = Math.floor(rng() * 7) - 3;
  const b = Math.floor(rng() * 7) - 3;
  const r = Math.floor(rng() * 4) + 1;
  // D = -2a, E = -2b, F = a² + b² - r²
  const D = -2 * a;
  const E = -2 * b;
  const F = a * a + b * b - r * r;

  const terms: string[] = ["x² + y²"];
  if (D !== 0) terms.push(`${signedTerm(D)}x`);
  if (E !== 0) terms.push(`${signedTerm(E)}y`);
  if (F !== 0) terms.push(`${signedTerm(F)}`);

  const expr = `${terms.join(" ")} = 0 の中心と半径`;
  const answerExpr = `中心 (${fmt(a)}, ${fmt(b)})，半径 ${r}`;
  return { expr, answerExpr, isNL: true };
};

const generateIntersection = (rng: () => number): CircleEqProblem | null => {
  // Circle x²+y²=r² and line y=mx+k — count intersection points via discriminant
  const r = Math.floor(rng() * 4) + 2;
  const m = Math.floor(rng() * 5) - 2;
  const k = Math.floor(rng() * 7) - 3;

  // Substitute y=mx+k into x²+y²=r²:
  // (1+m²)x² + 2mkx + k²−r² = 0
  const A = 1 + m * m;
  const B = 2 * m * k;
  const C = k * k - r * r;
  const disc = B * B - 4 * A * C;

  let countStr: string;
  if (disc > 0) countStr = "2 個";
  else if (disc === 0) countStr = "1 個（接する）";
  else countStr = "0 個（交わらない）";

  const lineStr = m === 0 ? `y = ${fmt(k)}` :
    (k === 0 ? `y = ${fmtCoeff(m)}x` : `y = ${fmtCoeff(m)}x ${k > 0 ? `+ ${k}` : `− ${-k}`}`);

  const expr = `円 x² + y² = ${r * r} と直線 ${lineStr} の共有点の個数`;
  const answerExpr = `判別式 D = ${disc}，共有点は ${countStr}`;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const signedTerm = (n: number): string => {
  if (n > 0) return `+ ${n}`;
  return `− ${-n}`;
};

const fmtCoeff = (n: number): string => {
  if (n === 1) return "";
  if (n === -1) return "−";
  return fmt(n);
};
