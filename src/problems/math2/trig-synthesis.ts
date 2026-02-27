import { mulberry32 } from "../random";
import { simplifyRoot } from "../shared/latex-format";

export interface TrigFuncProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateTrigSynthesis = (
  seed: number,
  count = 10,
): TrigFuncProblem[] => {
  const rng = mulberry32(seed);
  const problems: TrigFuncProblem[] = [];
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

const generateOne = (rng: () => number): TrigFuncProblem | null => {
  const a = Math.floor(rng() * 4) + 1;
  const b = Math.floor(rng() * 4) + 1;
  const r2 = a * a + b * b;

  const [outer, inner] = simplifyRoot(r2);
  const rStr = inner === 1 ? `${outer}` : (outer === 1 ? `√${inner}` : `${outer}√${inner}`);

  const expr = `${a} sin θ + ${b} cos θ を r sin(θ + α) の形にせよ`;
  const answerExpr = `${rStr} sin(θ + α)　ただし tan α = ${b}/${a}`;
  return { expr, answerExpr, isNL: true };
};
