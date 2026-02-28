import { mulberry32 } from "../random";

export interface SetsLogicProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateSetsLogic = (
  seed: number,
  count = 10,
): SetsLogicProblem[] => {
  const rng = mulberry32(seed);
  const problems: SetsLogicProblem[] = [];
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

const generateOne = (rng: () => number): SetsLogicProblem | null => {
  const variant = Math.floor(rng() * 5);

  if (variant === 0) return generateIntersection(rng);
  if (variant === 1) return generateUnion(rng);
  if (variant === 2) return generateComplement(rng);
  if (variant === 3) return generateInclusionExclusion(rng);
  return generateNecessarySufficient(rng);
};

const generateIntersection = (rng: () => number): SetsLogicProblem | null => {
  const [a, b] = makeTwoSets(rng);
  const inter = a.filter((x) => b.includes(x)).sort((x, y) => x - y);
  const expr = `A = {${a.join(", ")}}, B = {${b.join(", ")}} のとき，A ∩ B`;
  const answerExpr = inter.length === 0 ? "∅" : `{${inter.join(", ")}}`;
  return { expr, answerExpr, isNL: true };
};

const generateUnion = (rng: () => number): SetsLogicProblem | null => {
  const [a, b] = makeTwoSets(rng);
  const union = [...new Set([...a, ...b])].sort((x, y) => x - y);
  const expr = `A = {${a.join(", ")}}, B = {${b.join(", ")}} のとき，A ∪ B`;
  const answerExpr = `{${union.join(", ")}}`;
  return { expr, answerExpr, isNL: true };
};

const generateComplement = (rng: () => number): SetsLogicProblem | null => {
  const u = makeUniversal(rng);
  const aSize = Math.floor(rng() * 3) + 2;
  const a = pickSubset(rng, u, aSize);
  const comp = u.filter((x) => !a.includes(x)).sort((x, y) => x - y);
  const expr = `全体集合 U = {${u.join(", ")}}, A = {${a.join(", ")}} のとき，Ā`;
  const answerExpr = comp.length === 0 ? "∅" : `{${comp.join(", ")}}`;
  return { expr, answerExpr, isNL: true };
};

const generateInclusionExclusion = (rng: () => number): SetsLogicProblem | null => {
  const nA = Math.floor(rng() * 6) + 5;
  const nB = Math.floor(rng() * 6) + 5;
  const nAB = Math.floor(rng() * Math.min(nA, nB)) + 1;
  const nAuB = nA + nB - nAB;
  const expr = `|A| = ${nA}, |B| = ${nB}, |A ∩ B| = ${nAB} のとき，|A ∪ B|`;
  const answerExpr = `${nA} + ${nB} − ${nAB} = ${nAuB}`;
  return { expr, answerExpr, isNL: true };
};

const generateNecessarySufficient = (rng: () => number): SetsLogicProblem | null => {
  const templates: [string, string, string][] = [
    ["x² = 4", "x = 2", "偽（反例：x = −2）"],
    ["x = 2", "x² = 4", "真"],
    ["x² − 5x + 6 = 0", "x = 2", "偽（反例：x = 3）"],
    ["x > 3", "x > 1", "真"],
    ["x > 1", "x > 3", "偽（反例：x = 2）"],
    ["xy = 0", "x = 0", "偽（反例：x = 1, y = 0）"],
    ["x = 0", "xy = 0", "真"],
    ["x² = x", "x = 1", "偽（反例：x = 0）"],
  ];
  const [p, q, answer] = templates[Math.floor(rng() * templates.length)];
  const expr = `「${p} ⇒ ${q}」は真か偽か`;
  return { expr, answerExpr: answer, isNL: true };
};

const makeTwoSets = (rng: () => number): [number[], number[]] => {
  const pool = Array.from({ length: 10 }, (_, i) => i + 1);
  const a = pickSubset(rng, pool, Math.floor(rng() * 3) + 3);
  const b = pickSubset(rng, pool, Math.floor(rng() * 3) + 3);
  return [a.sort((x, y) => x - y), b.sort((x, y) => x - y)];
};

const makeUniversal = (rng: () => number): number[] => {
  const start = Math.floor(rng() * 3) + 1;
  const size = Math.floor(rng() * 3) + 6;
  return Array.from({ length: size }, (_, i) => start + i);
};

const pickSubset = (rng: () => number, pool: number[], size: number): number[] => {
  const copy = [...pool];
  const result: number[] = [];
  for (let i = 0; i < size && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};
