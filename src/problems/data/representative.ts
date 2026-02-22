import { mulberry32 } from "../random";

export interface RepresentativeProblem {
  data: number[];
  meanAnswer: string;
  medianAnswer: string;
  modeAnswer: string;
}

export const generateRepresentative = (
  seed: number,
  _find?: "mean" | "median" | "mode" | "mixed",
): RepresentativeProblem[] => {
  const rng = mulberry32(seed);
  const problems: RepresentativeProblem[] = [];

  for (let i = 0; i < 8; i++) {
    const n = 7 + Math.floor(rng() * 4); // 7-10 data points
    const data: number[] = [];

    // ensure a clear mode by repeating one value
    const modeVal = 1 + Math.floor(rng() * 20);
    const modeCount = 2 + Math.floor(rng() * 2); // 2-3 times
    for (let j = 0; j < modeCount; j++) data.push(modeVal);

    while (data.length < n) {
      let v = 1 + Math.floor(rng() * 20);
      // avoid creating another mode
      if (data.filter(d => d === v).length >= modeCount - 1 && v !== modeVal) {
        v = modeVal; // just add the mode value instead
      }
      data.push(v);
    }

    // shuffle
    for (let j = data.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [data[j], data[k]] = [data[k], data[j]];
    }

    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const meanStr = Number.isInteger(mean) ? String(mean) : Number(mean.toFixed(1)).toString();

    let median: number;
    if (n % 2 === 0) {
      median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    } else {
      median = sorted[Math.floor(n / 2)];
    }
    const medianStr = Number.isInteger(median) ? String(median) : Number(median.toFixed(1)).toString();

    // find mode (most frequent)
    const freq = new Map<number, number>();
    for (const d of data) freq.set(d, (freq.get(d) ?? 0) + 1);
    let maxFreq = 0;
    let mode = data[0];
    for (const [val, cnt] of freq) {
      if (cnt > maxFreq) { maxFreq = cnt; mode = val; }
    }

    problems.push({
      data,
      meanAnswer: meanStr,
      medianAnswer: medianStr,
      modeAnswer: String(mode),
    });
  }
  return problems;
};
