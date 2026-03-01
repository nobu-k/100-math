import { mulberry32 } from "../random";

export interface SequenceProblem {
  cells: (number | null)[]; // null = blank
  answers: number[];
}

const STEP_CHOICES = [1, 2, 5, 10];
const SEQ_LENGTH = 8;
const PROBLEM_COUNT = 6;

export const generateSequence = (
  seed: number,
  step: number,
  max: number,
): SequenceProblem[] => {
  const rng = mulberry32(seed);
  const problems: SequenceProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < PROBLEM_COUNT; i++) {
    const problem = generateOneRow(rng, step, max, seen);
    if (problem) problems.push(problem);
  }
  return problems;
};

const generateOneRow = (
  rng: () => number,
  step: number,
  max: number,
  seen: Set<string>,
): SequenceProblem | null => {
  for (let attempt = 0; attempt < 50; attempt++) {
    const rowStep = step === 0
      ? STEP_CHOICES[Math.floor(rng() * STEP_CHOICES.length)]
      : step;

    const span = rowStep * (SEQ_LENGTH - 1);
    if (span + 1 > max) continue; // step too large for max

    const ascending = rng() < 0.7;
    const start = pickStart(rng, rowStep, max, ascending);
    if (start === null) continue;

    const allNums = buildSequence(start, rowStep, ascending);

    const key = allNums.join(",");
    if (seen.has(key)) continue;
    seen.add(key);

    return buildProblem(rng, allNums);
  }
  return null;
};

const pickStart = (
  rng: () => number,
  rowStep: number,
  max: number,
  ascending: boolean,
): number | null => {
  const span = rowStep * (SEQ_LENGTH - 1);
  if (ascending) {
    // need: start >= 1, start + span <= max
    const lo = 1;
    const hi = max - span;
    if (hi < lo) return null;
    let start = lo + Math.floor(rng() * (hi - lo + 1));
    if (rowStep > 1) {
      start = Math.ceil(start / rowStep) * rowStep;
      if (start < lo || start + span > max) return null;
    }
    return start;
  } else {
    // need: start - span >= 1, start <= max
    const lo = span + 1;
    const hi = max;
    if (hi < lo) return null;
    let start = lo + Math.floor(rng() * (hi - lo + 1));
    if (rowStep > 1) {
      start = Math.floor(start / rowStep) * rowStep;
      if (start < lo || start > hi) return null;
    }
    return start;
  }
};

const buildSequence = (start: number, rowStep: number, ascending: boolean): number[] =>
  Array.from({ length: SEQ_LENGTH }, (_, j) =>
    ascending ? start + rowStep * j : start - rowStep * j,
  );

const buildProblem = (rng: () => number, allNums: number[]): SequenceProblem => {
  // pick 3 blanks (not first or last)
  const inner = Array.from({ length: SEQ_LENGTH - 2 }, (_, k) => k + 1);
  for (let j = inner.length - 1; j > 0; j--) {
    const k = Math.floor(rng() * (j + 1));
    [inner[j], inner[k]] = [inner[k], inner[j]];
  }
  const blankSet = new Set(inner.slice(0, 3));

  const cells: (number | null)[] = [];
  const answers: number[] = [];
  for (let j = 0; j < SEQ_LENGTH; j++) {
    if (blankSet.has(j)) {
      cells.push(null);
      answers.push(allNums[j]);
    } else {
      cells.push(allNums[j]);
    }
  }
  return { cells, answers };
};
