import { mulberry32 } from "../random";

export interface SequenceProblem {
  cells: (number | null)[]; // null = blank
  answers: number[];
}

const STEP_CHOICES = [1, 2, 5, 10];

export const generateSequence = (
  seed: number,
  step: number,
  max: number,
): SequenceProblem[] => {
  const rng = mulberry32(seed);
  const problems: SequenceProblem[] = [];
  const length = 8;

  for (let i = 0; i < 6; i++) {
    const rowStep = step === 0
      ? STEP_CHOICES[Math.floor(rng() * STEP_CHOICES.length)]
      : step;
    const ascending = rng() < 0.7;
    let start: number;
    if (ascending) {
      const maxStart = max - rowStep * (length - 1);
      if (maxStart < 1) {
        start = rowStep;
      } else {
        start = 1 + Math.floor(rng() * maxStart);
        if (rowStep > 1) start = Math.max(rowStep, Math.ceil(start / rowStep) * rowStep);
      }
    } else {
      const minStart = rowStep * (length - 1) + 1;
      if (minStart > max) {
        start = max;
      } else {
        start = minStart + Math.floor(rng() * (max - minStart + 1));
        if (rowStep > 1) start = Math.floor(start / rowStep) * rowStep;
        if (start < minStart) start = minStart;
      }
    }

    const allNums: number[] = [];
    for (let j = 0; j < length; j++) {
      allNums.push(ascending ? start + rowStep * j : start - rowStep * j);
    }

    // pick 3 blanks (not first or last)
    const inner = Array.from({ length: length - 2 }, (_, k) => k + 1);
    for (let j = inner.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [inner[j], inner[k]] = [inner[k], inner[j]];
    }
    const blankSet = new Set(inner.slice(0, 3));

    const cells: (number | null)[] = [];
    const answers: number[] = [];
    for (let j = 0; j < length; j++) {
      if (blankSet.has(j)) {
        cells.push(null);
        answers.push(allNums[j]);
      } else {
        cells.push(allNums[j]);
      }
    }
    problems.push({ cells, answers });
  }
  return problems;
};
