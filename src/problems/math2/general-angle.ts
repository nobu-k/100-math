import { mulberry32 } from "../random";
import { STANDARD_ANGLES } from "../shared/trig-utils";

export interface TrigFuncProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateGeneralAngle = (
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
  const variant = Math.floor(rng() * 2);

  if (variant === 0) {
    const baseAngles = [30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 300, 330];
    const base = baseAngles[Math.floor(rng() * baseAngles.length)];
    const extraRotations = Math.floor(rng() * 2) + 1;
    const deg = base + 360 * extraRotations;

    const funcs = ["sin", "cos"] as const;
    const func = funcs[Math.floor(rng() * funcs.length)];

    const entry = STANDARD_ANGLES.find((a) => a.degrees === base);
    if (!entry) return null;
    if (func === "sin" && entry.sin === "\\text{undefined}") return null;
    if (func === "cos" && entry.cos === "\\text{undefined}") return null;

    const answer = func === "sin" ? entry.sin : entry.cos;
    const expr = `${func} ${deg}°`;
    const answerExpr = `${func} ${base}° = ${latexToUnicode(answer)}`;
    return { expr, answerExpr };
  }

  const baseAngles = [30, 45, 60, 120, 135, 150];
  const base = baseAngles[Math.floor(rng() * baseAngles.length)];

  const funcs = ["sin", "cos"] as const;
  const func = funcs[Math.floor(rng() * funcs.length)];

  const entry = STANDARD_ANGLES.find((a) => a.degrees === base);
  if (!entry) return null;

  let answer: string;
  if (func === "sin") {
    answer = negateLatex(entry.sin);
  } else {
    answer = entry.cos;
  }

  const expr = `${func}(−${base}°)`;
  const answerExpr = latexToUnicode(answer);
  return { expr, answerExpr };
};

const latexToUnicode = (latex: string): string =>
  latex
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]*)\}/g, "√$1")
    .replace(/-/g, "−")
    .replace(/\\text\{undefined\}/g, "定義なし");

const negateLatex = (latex: string): string => {
  if (latex === "0") return "0";
  if (latex.startsWith("-")) return latex.slice(1);
  return `-${latex}`;
};
