import { mulberry32 } from "../random";

export type ParallelAngleMode = "vertical" | "corresponding" | "alternate" | "mixed";

export interface ParallelAngleProblem {
  type: "vertical" | "corresponding" | "alternate";
  givenAngle: number;
  question: string;
  answer: number;
  answerDisplay: string;
}

export function generateParallelAngle(
  seed: number,
  mode: ParallelAngleMode = "mixed",
): ParallelAngleProblem[] {
  const rng = mulberry32(seed);
  const problems: ParallelAngleProblem[] = [];
  const seen = new Set<string>();
  const types: ("vertical" | "corresponding" | "alternate")[] =
    mode === "mixed"
      ? ["vertical", "corresponding", "alternate"]
      : [mode as "vertical" | "corresponding" | "alternate"];

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type = types[Math.floor(rng() * types.length)];
      const angle = 30 + Math.floor(rng() * 121); // 30-150

      let question: string;
      let answer: number;

      if (type === "vertical") {
        question = `∠a = ${angle}° のとき、対頂角 ∠b = ?`;
        answer = angle;
      } else if (type === "corresponding") {
        // Corresponding angles are equal when lines are parallel
        const variant = rng() < 0.5;
        if (variant) {
          question = `2直線が平行のとき、∠a = ${angle}° ならば同位角 ∠b = ?`;
          answer = angle;
        } else {
          // Supplementary with adjacent angle
          question = `2直線が平行のとき、∠a = ${angle}° ならば ∠b（同側内角）= ?`;
          answer = 180 - angle;
        }
      } else {
        // Alternate interior angles are equal
        question = `2直線が平行のとき、∠a = ${angle}° ならば錯角 ∠b = ?`;
        answer = angle;
      }

      const key = `${type}-${angle}-${answer}`;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({
          type,
          givenAngle: angle,
          question,
          answer,
          answerDisplay: `${answer}°`,
        });
        break;
      }
    }
  }
  return problems;
}
