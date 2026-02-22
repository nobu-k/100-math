import { mulberry32 } from "../random";

export type ParallelogramMode = "sides" | "angles" | "diagonals" | "mixed";

export interface ParallelogramProblem {
  type: "sides" | "angles" | "diagonals";
  question: string;
  answer: number;
  answerDisplay: string;
}

export const generateParallelogram = (
  seed: number,
  mode: ParallelogramMode = "mixed",
): ParallelogramProblem[] => {
  const rng = mulberry32(seed);
  const problems: ParallelogramProblem[] = [];
  const seen = new Set<string>();
  const types: ("sides" | "angles" | "diagonals")[] =
    mode === "mixed" ? ["sides", "angles", "diagonals"] : [mode as any];

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type = types[Math.floor(rng() * types.length)];

      let question: string;
      let answer: number;

      if (type === "sides") {
        const ab = 3 + Math.floor(rng() * 12); // 3-14
        const bc = 3 + Math.floor(rng() * 12);
        if (ab === bc) continue;
        const variant = rng() < 0.5;
        if (variant) {
          question = `平行四辺形ABCDで AB = ${ab}cm のとき CD = ?`;
          answer = ab;
        } else {
          question = `平行四辺形ABCDで AB = ${ab}cm, BC = ${bc}cm のとき周の長さ = ?`;
          answer = 2 * (ab + bc);
        }
      } else if (type === "angles") {
        const angleA = 40 + Math.floor(rng() * 101); // 40-140
        const variant = rng();
        if (variant < 0.33) {
          question = `平行四辺形ABCDで ∠A = ${angleA}° のとき ∠C = ?`;
          answer = angleA; // opposite angles equal
        } else if (variant < 0.66) {
          question = `平行四辺形ABCDで ∠A = ${angleA}° のとき ∠B = ?`;
          answer = 180 - angleA; // adjacent angles supplementary
        } else {
          question = `平行四辺形ABCDで ∠A = ${angleA}° のとき ∠D = ?`;
          answer = 180 - angleA;
        }
      } else {
        // diagonals bisect each other
        const ao = 3 + Math.floor(rng() * 10); // 3-12
        const bo = 3 + Math.floor(rng() * 10);
        const variant = rng() < 0.5;
        if (variant) {
          question = `平行四辺形ABCDの対角線の交点をOとする。AO = ${ao}cm のとき AC = ?`;
          answer = ao * 2;
        } else {
          question = `平行四辺形ABCDの対角線の交点をOとする。BO = ${bo}cm のとき BD = ?`;
          answer = bo * 2;
        }
      }

      const key = `${type}-${question}`;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({
          type,
          question,
          answer,
          answerDisplay: type === "angles" ? `${answer}°` : `${answer}cm`,
        });
        break;
      }
    }
  }
  return problems;
};
