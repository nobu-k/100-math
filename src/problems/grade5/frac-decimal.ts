import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateFracDecimal = (
  seed: number,
  direction: "to-decimal" | "to-fraction" | "mixed",
): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const cleanFracs: [number, number][] = [
    [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
    [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10], [9, 10],
    [1, 20], [3, 20], [7, 20], [9, 20],
    [1, 25], [2, 25], [3, 25], [4, 25],
  ];

  for (let i = 0; i < 10; i++) {
    const dir = direction === "mixed"
      ? (rng() < 0.5 ? "to-decimal" : "to-fraction")
      : direction;

    const [num, den] = cleanFracs[Math.floor(rng() * cleanFracs.length)];
    const decimal = num / den;
    const decStr = decimal % 1 === 0 ? String(decimal) : decimal.toFixed(
      String(decimal).split(".")[1]?.length ?? 1
    );

    if (dir === "to-decimal") {
      problems.push({ question: `${num}/${den} を小数で表しなさい`, answer: decStr });
    } else {
      problems.push({ question: `${decStr} を分数で表しなさい`, answer: `${num}/${den}` });
    }
  }
  return problems;
};
