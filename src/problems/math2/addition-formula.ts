import { mulberry32 } from "../random";
import { STANDARD_ANGLES } from "../shared/trig-utils";

export interface TrigFuncProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateAdditionFormula = (
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
  const pairs: [number, number][] = [
    [45, 30], [60, 45], [60, 30], [45, 15], [30, 15],
  ];
  const [a, b] = pairs[Math.floor(rng() * pairs.length)];
  const isAdd = rng() < 0.5;
  const func = rng() < 0.5 ? "sin" : "cos";

  const resultDeg = isAdd ? a + b : a - b;
  const entry = STANDARD_ANGLES.find((e) => e.degrees === resultDeg);
  if (!entry) return null;

  const op = isAdd ? "+" : "−";
  const answer = func === "sin" ? entry.sin : entry.cos;
  const expr = `${func}(${a}° ${op} ${b}°)`;
  const answerExpr = `${func} ${resultDeg}° = ${latexToUnicode(answer)}`;
  return { expr, answerExpr };
};

const latexToUnicode = (latex: string): string =>
  latex
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]*)\}/g, "√$1")
    .replace(/-/g, "−")
    .replace(/\\text\{undefined\}/g, "定義なし");
