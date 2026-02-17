import { mulberry32 } from "../random";

export interface SequenceProblem {
  cells: (number | null)[]; // null = blank
  answers: number[];
}

export function generateSequence(
  seed: number,
  step: number,
  max: number,
): SequenceProblem[] {
  const rng = mulberry32(seed);
  const problems: SequenceProblem[] = [];
  const length = 8;

  for (let i = 0; i < 6; i++) {
    const ascending = rng() < 0.7;
    let start: number;
    if (ascending) {
      const maxStart = max - step * (length - 1);
      if (maxStart < 1) {
        start = step;
      } else {
        start = 1 + Math.floor(rng() * maxStart);
        if (step > 1) start = Math.max(step, Math.ceil(start / step) * step);
      }
    } else {
      const minStart = step * (length - 1) + 1;
      if (minStart > max) {
        start = max;
      } else {
        start = minStart + Math.floor(rng() * (max - minStart + 1));
        if (step > 1) start = Math.floor(start / step) * step;
        if (start < minStart) start = minStart;
      }
    }

    const allNums: number[] = [];
    for (let j = 0; j < length; j++) {
      allNums.push(ascending ? start + step * j : start - step * j);
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
}
