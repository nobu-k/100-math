import { mulberry32 } from "../random";

export interface FreqTableProblem {
  data: number[];
  classWidth: number;
  classStart: number;
  classes: string[];
  frequencies: (number | null)[];
  answers: number[];
}

export const generateFreqTable = (seed: number): FreqTableProblem[] => {
  const rng = mulberry32(seed);
  const problems: FreqTableProblem[] = [];

  for (let t = 0; t < 4; t++) {
    const n = 15 + Math.floor(rng() * 11); // 15-25 data points
    const classWidth = [5, 10][Math.floor(rng() * 2)];
    const classStart = 0;
    const numClasses = 4 + Math.floor(rng() * 3); // 4-6 classes

    // generate data within range
    const maxVal = classStart + classWidth * numClasses;
    const data: number[] = [];
    for (let i = 0; i < n; i++) {
      data.push(classStart + Math.floor(rng() * maxVal));
    }

    // compute frequencies
    const classes: string[] = [];
    const freqValues: number[] = [];
    for (let c = 0; c < numClasses; c++) {
      const lo = classStart + c * classWidth;
      const hi = lo + classWidth;
      classes.push(`${lo}以上${hi}未満`);
      freqValues.push(data.filter(d => d >= lo && d < hi).length);
    }

    // blank 2-3 frequencies
    const numBlanks = 2 + Math.floor(rng() * 2);
    const blankSet = new Set<number>();
    while (blankSet.size < numBlanks && blankSet.size < numClasses) {
      blankSet.add(Math.floor(rng() * numClasses));
    }

    const frequencies: (number | null)[] = freqValues.map((f, idx) =>
      blankSet.has(idx) ? null : f
    );
    const answers = [...blankSet].sort().map(idx => freqValues[idx]);

    problems.push({ data, classWidth, classStart, classes, frequencies, answers });
  }
  return problems;
};
