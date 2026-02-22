import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateCircleArea = (
  seed: number,
  type: "basic" | "half" | "mixed",
): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const t = type === "mixed"
      ? (rng() < 0.6 ? "basic" : "half")
      : type;

    const radius = 1 + Math.floor(rng() * 15);

    if (t === "basic") {
      const area = radius * radius * 3.14;
      // round to 2 decimal places
      const areaStr = Number(area.toFixed(2)).toString();
      problems.push({
        question: `半径${radius}cmの円の面積は？（円周率3.14）`,
        answer: `${areaStr}cm²`,
      });
    } else {
      // semicircle
      const area = radius * radius * 3.14 / 2;
      const areaStr = Number(area.toFixed(2)).toString();
      problems.push({
        question: `半径${radius}cmの半円の面積は？（円周率3.14）`,
        answer: `${areaStr}cm²`,
      });
    }
  }
  return problems;
};
