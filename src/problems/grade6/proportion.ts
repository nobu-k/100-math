import { mulberry32 } from "../random";

export interface ProportionProblem {
  label: string; // "比例" or "反比例"
  xValues: number[];
  yValues: (number | null)[];
  answers: number[];
}

export function generateProportion(
  seed: number,
  propType: "direct" | "inverse" | "mixed",
): ProportionProblem[] {
  const rng = mulberry32(seed);
  const problems: ProportionProblem[] = [];

  for (let i = 0; i < 6; i++) {
    const isDirect = propType === "direct" ? true
      : propType === "inverse" ? false
      : rng() < 0.5;

    const constant = 2 + Math.floor(rng() * 11); // 2-12
    const xValues = [1, 2, 3, 4, 5, 6];

    if (isDirect) {
      // y = constant * x
      const allY = xValues.map(x => constant * x);
      // blank 2 random y values
      const blankIndices = new Set<number>();
      while (blankIndices.size < 2) {
        blankIndices.add(Math.floor(rng() * 6));
      }
      const yValues: (number | null)[] = allY.map((y, idx) =>
        blankIndices.has(idx) ? null : y
      );
      const answers = [...blankIndices].sort().map(idx => allY[idx]);
      problems.push({ label: "比例", xValues, yValues, answers });
    } else {
      // y = constant / x — only use x values that divide evenly
      const xVals = [1, 2, 3, 4, 6]; // all divide into reasonable numbers
      const c = (2 + Math.floor(rng() * 5)) * 12; // 24,36,48,60,72 — divisible by 1,2,3,4,6
      const allY = xVals.map(x => c / x);
      const blankIndices = new Set<number>();
      while (blankIndices.size < 2) {
        blankIndices.add(Math.floor(rng() * xVals.length));
      }
      const yValues: (number | null)[] = allY.map((y, idx) =>
        blankIndices.has(idx) ? null : y
      );
      const answers = [...blankIndices].sort().map(idx => allY[idx]);
      problems.push({ label: "反比例", xValues: xVals, yValues, answers });
    }
  }
  return problems;
}
