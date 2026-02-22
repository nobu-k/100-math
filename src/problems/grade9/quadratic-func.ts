import { mulberry32 } from "../random";

export type QuadFuncMode = "value" | "rate-of-change" | "graph" | "mixed";

export interface QuadFuncProblem {
  type: QuadFuncMode;
  question: string;
  answer: number | string;
  answerDisplay: string;
}

export function generateQuadFunc(
  seed: number,
  mode: QuadFuncMode = "mixed",
): QuadFuncProblem[] {
  const rng = mulberry32(seed);
  const problems: QuadFuncProblem[] = [];
  const seen = new Set<string>();
  const types: QuadFuncMode[] =
    mode === "mixed" ? ["value", "rate-of-change", "graph"] : [mode];

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type = types[Math.floor(rng() * types.length)];

      let question: string;
      let answer: number | string;
      let answerDisplay: string;

      if (type === "value") {
        const variant = Math.floor(rng() * 3);
        let a = Math.floor(rng() * 9) - 4;
        if (a === 0) a = 1;

        if (variant === 0) {
          // Find y given x
          const x = Math.floor(rng() * 9) - 4;
          if (x === 0) continue;
          const y = a * x * x;
          const aStr = a === 1 ? "" : a === -1 ? "−" : `${a}`;
          question = `y = ${aStr}x² のとき、x = ${x} なら y = ?`;
          answer = y;
          answerDisplay = `${y}`;
        } else if (variant === 1) {
          // Find a given point
          const x = Math.floor(rng() * 5) + 1;
          const y = a * x * x;
          if (Math.abs(y) > 50) continue;
          question = `y = ax² のグラフが点 (${x}, ${y}) を通るとき a = ?`;
          answer = a;
          answerDisplay = `${a}`;
        } else {
          // Find x given y (positive a, x > 0)
          if (a < 0) a = -a;
          const x = 1 + Math.floor(rng() * 5); // 1-5
          const y = a * x * x;
          question = `y = ${a === 1 ? "" : a}x² のとき、y = ${y} なら x = ? (x > 0)`;
          answer = x;
          answerDisplay = `${x}`;
        }
      } else if (type === "rate-of-change") {
        let a = Math.floor(rng() * 7) - 3;
        if (a === 0) a = 1;

        const x1 = Math.floor(rng() * 5) - 2; // -2 to 2
        const x2 = x1 + 1 + Math.floor(rng() * 4); // x1+1 to x1+4
        const y1 = a * x1 * x1;
        const y2 = a * x2 * x2;
        const rate = (y2 - y1) / (x2 - x1);
        if (rate !== Math.floor(rate)) continue;

        const aStr = a === 1 ? "" : a === -1 ? "−" : `${a}`;
        question = `y = ${aStr}x² で、x が ${x1} から ${x2} に増加するとき変化の割合は？`;
        answer = rate;
        answerDisplay = `${rate}`;
      } else {
        // Graph characteristics
        let a = Math.floor(rng() * 7) - 3;
        if (a === 0) a = 1;

        const variant = Math.floor(rng() * 3);
        if (variant === 0) {
          // Opening direction
          const aStr = a === 1 ? "" : a === -1 ? "−" : `${a}`;
          question = `y = ${aStr}x² のグラフは上に開く？下に開く？`;
          answer = a > 0 ? "上" : "下";
          answerDisplay = a > 0 ? "上に開く" : "下に開く";
        } else if (variant === 1) {
          // Width comparison
          let a2 = Math.floor(rng() * 7) - 3;
          if (a2 === 0) a2 = 2;
          if (Math.abs(a) === Math.abs(a2)) continue;
          const aStr = a === 1 ? "" : a === -1 ? "−" : `${a}`;
          const a2Str = a2 === 1 ? "" : a2 === -1 ? "−" : `${a2}`;
          const wider = Math.abs(a) < Math.abs(a2) ? `y = ${aStr}x²` : `y = ${a2Str}x²`;
          question = `y = ${aStr}x² と y = ${a2Str}x² のグラフで、幅が広いのは？`;
          answer = wider;
          answerDisplay = wider;
        } else {
          // Find a from point on graph
          const x = 1 + Math.floor(rng() * 4);
          const y = a * x * x;
          if (Math.abs(y) > 40) continue;
          question = `y = ax² のグラフが点 (${x}, ${y}) を通る。a の値は？`;
          answer = a;
          answerDisplay = `${a}`;
        }
      }

      const key = question;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({ type, question, answer, answerDisplay });
        break;
      }
    }
  }
  return problems;
}
