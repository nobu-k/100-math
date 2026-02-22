import { mulberry32 } from "../random";

export type PolygonAngleMode = "interior-sum" | "regular" | "exterior" | "find-n" | "mixed";

export interface PolygonAngleProblem {
  type: PolygonAngleMode;
  /** Number of sides */
  n?: number;
  /** Question text */
  question: string;
  /** Answer */
  answer: number;
  /** Answer display */
  answerDisplay: string;
}

const polygonNames: Record<number, string> = {
  3: "三角形",
  4: "四角形",
  5: "五角形",
  6: "六角形",
  7: "七角形",
  8: "八角形",
  9: "九角形",
  10: "十角形",
  12: "十二角形",
};

export const generatePolygonAngle = (
  seed: number,
  mode: PolygonAngleMode = "mixed",
): PolygonAngleProblem[] => {
  const rng = mulberry32(seed);
  const problems: PolygonAngleProblem[] = [];
  const seen = new Set<string>();
  const types: PolygonAngleMode[] =
    mode === "mixed"
      ? ["interior-sum", "regular", "exterior", "find-n"]
      : [mode];

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const type = types[Math.floor(rng() * types.length)];
      const ns = [3, 4, 5, 6, 7, 8, 9, 10, 12];
      const n = ns[Math.floor(rng() * ns.length)];
      const name = polygonNames[n] || `${n}角形`;

      let question: string;
      let answer: number;
      let answerDisplay: string;

      if (type === "interior-sum") {
        question = `${name}の内角の和は何度？`;
        answer = (n - 2) * 180;
        answerDisplay = `${answer}°`;
      } else if (type === "regular") {
        answer = ((n - 2) * 180) / n;
        if (answer !== Math.floor(answer)) continue; // skip non-integer
        question = `正${name}の1つの内角は何度？`;
        answerDisplay = `${answer}°`;
      } else if (type === "exterior") {
        question = `${name}の外角の和は何度？`;
        answer = 360;
        answerDisplay = "360°";
      } else {
        // find-n: given interior sum, find n
        const interiorSum = (n - 2) * 180;
        question = `内角の和が ${interiorSum}° の多角形は何角形？`;
        answer = n;
        answerDisplay = `${n}角形`;
      }

      const key = `${type}-${n}`;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({ type, n, question, answer, answerDisplay });
        break;
      }
    }
  }
  return problems;
};
