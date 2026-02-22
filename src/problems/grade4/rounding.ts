import { mulberry32 } from "../random";

export interface RoundingProblem {
  question: string;
  answer: string;
}

export const generateRounding = (
  seed: number,
  digits: number,
): RoundingProblem[] => {
  const rng = mulberry32(seed);
  const problems: RoundingProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const numDigits = 3 + Math.floor(rng() * digits);
    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits) - 1;
    const n = min + Math.floor(rng() * (max - min + 1));

    const positions = ["十の位", "百の位", "千の位"];
    const posIdx = Math.min(Math.floor(rng() * numDigits - 1), positions.length - 1);
    const pos = positions[Math.max(0, posIdx)];

    let divisor: number;
    switch (pos) {
      case "十の位": divisor = 10; break;
      case "百の位": divisor = 100; break;
      default: divisor = 1000; break;
    }
    const rounded = Math.round(n / divisor) * divisor;

    problems.push({
      question: `${n} を${pos}までの概数にしなさい`,
      answer: String(rounded),
    });
  }
  return problems;
};
