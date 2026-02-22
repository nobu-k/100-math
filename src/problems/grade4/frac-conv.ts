import { mulberry32 } from "../random";

export interface FracConvProblem {
  question: string;
  answer: string;
  fromWhole?: number;
  fromNum?: number;
  fromDen?: number;
  toWhole?: number;
  toNum?: number;
  toDen?: number;
  direction: "to-mixed" | "to-improper";
}

export const generateFracConv = (
  seed: number,
  direction: "to-mixed" | "to-improper" | "both",
): FracConvProblem[] => {
  const rng = mulberry32(seed);
  const problems: FracConvProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const dir = direction === "both"
      ? (rng() < 0.5 ? "to-mixed" : "to-improper")
      : direction;

    const den = 2 + Math.floor(rng() * 9);
    const whole = 1 + Math.floor(rng() * 5);
    const partNum = 1 + Math.floor(rng() * (den - 1));
    const improperNum = whole * den + partNum;

    if (dir === "to-mixed") {
      problems.push({
        question: `${improperNum}/${den} を帯分数にしなさい`,
        answer: `${whole}と${partNum}/${den}`,
        fromNum: improperNum, fromDen: den,
        toWhole: whole, toNum: partNum, toDen: den,
        direction: "to-mixed",
      });
    } else {
      problems.push({
        question: `${whole}と${partNum}/${den} を仮分数にしなさい`,
        answer: `${improperNum}/${den}`,
        fromWhole: whole, fromNum: partNum, fromDen: den,
        toNum: improperNum, toDen: den,
        direction: "to-improper",
      });
    }
  }
  return problems;
};
