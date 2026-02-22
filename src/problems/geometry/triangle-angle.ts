import { mulberry32 } from "../random";

export type TriAngleMode = "interior" | "exterior" | "mixed";

export interface TriAngleProblem {
  type: "interior" | "exterior";
  /** Known angles */
  knownAngles: number[];
  /** Question text */
  question: string;
  /** Answer */
  answer: number;
  answerDisplay: string;
}

export const generateTriAngle = (
  seed: number,
  mode: TriAngleMode = "mixed",
): TriAngleProblem[] => {
  const rng = mulberry32(seed);
  const problems: TriAngleProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 6; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type: "interior" | "exterior" =
        mode === "mixed"
          ? rng() < 0.5 ? "interior" : "exterior"
          : mode as "interior" | "exterior";

      // Generate 3 angles that sum to 180
      const a1 = 20 + Math.floor(rng() * 100); // 20-119
      const a2 = 20 + Math.floor(rng() * Math.min(80, 160 - a1 - 20)); // ensure a3 >= 20
      const a3 = 180 - a1 - a2;
      if (a3 < 15 || a3 > 140) continue;

      let question: string;
      let answer: number;

      if (type === "interior") {
        // Give 2 angles, find 3rd
        question = `三角形の2つの角が ${a1}° と ${a2}° のとき、残りの角は？`;
        answer = a3;
      } else {
        // Exterior angle = sum of non-adjacent interior angles
        question = `三角形の2つの角が ${a1}° と ${a2}° のとき、${a3}° の外角は？`;
        answer = a1 + a2;
      }

      const key = `${type}-${a1}-${a2}`;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({
          type,
          knownAngles: [a1, a2],
          question,
          answer,
          answerDisplay: `${answer}°`,
        });
        break;
      }
    }
  }
  return problems;
};
