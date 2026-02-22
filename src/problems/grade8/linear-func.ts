import { mulberry32 } from "../random";

export type LinearFuncMode = "slope-intercept" | "two-points" | "rate-of-change" | "mixed";

export interface LinearFuncProblem {
  type: LinearFuncMode;
  question: string;
  /** Slope a */
  answerA: number;
  /** Intercept b */
  answerB: number;
  /** Display answer */
  answerDisplay: string;
  /** Whether answer is a single number (for rate of change) */
  singleAnswer?: number;
}

export const generateLinearFunc = (
  seed: number,
  mode: LinearFuncMode = "mixed",
): LinearFuncProblem[] => {
  const rng = mulberry32(seed);
  const problems: LinearFuncProblem[] = [];
  const seen = new Set<string>();
  const types: LinearFuncMode[] =
    mode === "mixed"
      ? ["slope-intercept", "two-points", "rate-of-change"]
      : [mode];

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const type = types[Math.floor(rng() * types.length)];

      let question: string;
      let answerA: number;
      let answerB: number;
      let answerDisplay: string;
      let singleAnswer: number | undefined;

      if (type === "slope-intercept") {
        // Given slope and intercept, or slope and a point
        answerA = Math.floor(rng() * 11) - 5;
        if (answerA === 0) continue;
        answerB = Math.floor(rng() * 13) - 6;

        const variant = rng() < 0.5;
        if (variant) {
          question = `傾き ${answerA}、切片 ${answerB} の一次関数の式を求めなさい`;
        } else {
          // slope + point
          const px = Math.floor(rng() * 7) - 3;
          if (px === 0) continue;
          const py = answerA * px + answerB;
          if (Math.abs(py) > 20) continue;
          question = `変化の割合が ${answerA} で、点 (${px}, ${py}) を通る一次関数の式を求めなさい`;
        }
        answerDisplay = formatLinearFunc(answerA, answerB);
      } else if (type === "two-points") {
        // Two points -> find equation
        const x1 = Math.floor(rng() * 7) - 3;
        let x2 = Math.floor(rng() * 7) - 3;
        if (x1 === x2) x2 = x1 + 1 + Math.floor(rng() * 3);

        answerA = Math.floor(rng() * 9) - 4;
        if (answerA === 0) continue;
        answerB = Math.floor(rng() * 11) - 5;

        const y1 = answerA * x1 + answerB;
        const y2 = answerA * x2 + answerB;
        if (Math.abs(y1) > 15 || Math.abs(y2) > 15) continue;

        question = `2点 (${x1}, ${y1}) と (${x2}, ${y2}) を通る直線の式を求めなさい`;
        answerDisplay = formatLinearFunc(answerA, answerB);
      } else {
        // Rate of change
        answerA = Math.floor(rng() * 9) - 4;
        if (answerA === 0) continue;
        answerB = Math.floor(rng() * 9) - 4;

        const x1 = Math.floor(rng() * 5) + 1;
        const x2 = x1 + Math.floor(rng() * 4) + 1;
        const y1 = answerA * x1 + answerB;
        const y2 = answerA * x2 + answerB;
        if (Math.abs(y1) > 20 || Math.abs(y2) > 20) continue;

        question = `x が ${x1} から ${x2} まで増加するとき y は ${y1} から ${y2} に変化した。変化の割合は？`;
        answerDisplay = `${answerA}`;
        singleAnswer = answerA;
      }

      const key = question;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push({
          type,
          question,
          answerA,
          answerB,
          answerDisplay,
          singleAnswer,
        });
        break;
      }
    }
  }
  return problems;
};

const formatLinearFunc = (a: number, b: number): string => {
  const aStr = a === 1 ? "" : a === -1 ? "−" : `${a}`;
  if (b === 0) return `y = ${aStr}x`;
  if (b > 0) return `y = ${aStr}x + ${b}`;
  return `y = ${aStr}x − ${Math.abs(b)}`;
};
