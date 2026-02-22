import { mulberry32 } from "../random";

export interface ComparisonProblem {
  left: number;
  right: number;
  answer: "＞" | "＜" | "＝";
}

export const generateComparison = (
  seed: number,
  max: number,
): ComparisonProblem[] => {
  const rng = mulberry32(seed);
  const problems: ComparisonProblem[] = [];

  // Balanced: 5 each of ＞, ＜, ＝
  const types: ("＞" | "＜" | "＝")[] = [];
  for (let j = 0; j < 5; j++) types.push("＞");
  for (let j = 0; j < 5; j++) types.push("＜");
  for (let j = 0; j < 5; j++) types.push("＝");
  // Shuffle
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  for (const type of types) {
    let left: number, right: number;
    if (type === "＝") {
      left = 1 + Math.floor(rng() * max);
      right = left;
    } else {
      // Generate two distinct values, then order to match target type
      for (let attempt = 0; ; attempt++) {
        left = 1 + Math.floor(rng() * max);
        right = 1 + Math.floor(rng() * max);
        if (left !== right) break;
        if (attempt >= 20) { right = left === max ? left - 1 : left + 1; break; }
      }
      if (type === "＞" && left < right) [left, right] = [right, left];
      if (type === "＜" && left > right) [left, right] = [right, left];
    }
    const answer: "＞" | "＜" | "＝" =
      left > right ? "＞" : left < right ? "＜" : "＝";
    problems.push({ left, right, answer });
  }
  return problems;
};
