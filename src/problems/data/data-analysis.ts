import { mulberry32 } from "../random";

export type DataAnalysisMode = "representative" | "frequency" | "mixed";

export interface RepresentativeProblem {
  mode: "representative";
  /** The dataset */
  data: number[];
  /** Mean */
  mean: number;
  /** Median */
  median: number;
  /** Mode (most frequent value) */
  modeValue: number;
  /** Range */
  range: number;
}

export interface FrequencyProblem {
  mode: "frequency";
  /** Class intervals, e.g. [[0,10], [10,20], ...] */
  classes: [number, number][];
  /** Frequencies for each class */
  frequencies: number[];
  /** Relative frequencies */
  relativeFrequencies: number[];
  /** Cumulative frequencies */
  cumulativeFrequencies: number[];
  /** Total count */
  total: number;
  /** Which values to hide (indices) for the student to fill in */
  hiddenIndices: number[];
}

export type DataAnalysisProblem = RepresentativeProblem | FrequencyProblem;

export const generateDataAnalysis = (
  seed: number,
  mode: DataAnalysisMode = "mixed",
): DataAnalysisProblem[] => {
  const rng = mulberry32(seed);
  const problems: DataAnalysisProblem[] = [];

  const count =
    mode === "mixed" ? 8 : mode === "representative" ? 8 : 6;

  for (let i = 0; i < count; i++) {
    const pick =
      mode === "mixed"
        ? rng() < 0.6
          ? "representative"
          : "frequency"
        : mode;

    if (pick === "representative") {
      // Generate a dataset with a clear mode
      const size = 7 + Math.floor(rng() * 6); // 7-12
      const data: number[] = [];
      const modeVal = Math.floor(rng() * 20) + 1; // 1-20

      // Add the mode value 2-3 times
      const modeCount = 2 + Math.floor(rng() * 2);
      for (let j = 0; j < modeCount; j++) {
        data.push(modeVal);
      }

      // Fill rest with unique-ish values
      while (data.length < size) {
        let v = Math.floor(rng() * 25) + 1; // 1-25
        // Avoid creating another mode
        if (data.filter((x) => x === v).length >= modeCount) continue;
        data.push(v);
      }

      data.sort((a, b) => a - b);

      const sum = data.reduce((a, b) => a + b, 0);
      const mean = roundTo(sum / data.length, 1);
      const mid = Math.floor(data.length / 2);
      const median =
        data.length % 2 === 0
          ? roundTo((data[mid - 1] + data[mid]) / 2, 1)
          : data[mid];
      const range = data[data.length - 1] - data[0];

      // Find actual mode
      const freqMap = new Map<number, number>();
      for (const v of data) freqMap.set(v, (freqMap.get(v) || 0) + 1);
      let maxFreq = 0;
      let actualMode = data[0];
      for (const [val, freq] of freqMap) {
        if (freq > maxFreq) {
          maxFreq = freq;
          actualMode = val;
        }
      }

      problems.push({
        mode: "representative",
        data,
        mean,
        median,
        modeValue: actualMode,
        range,
      });
    } else {
      // Frequency distribution table
      const classWidth = rng() < 0.5 ? 5 : 10;
      const classCount = 5 + Math.floor(rng() * 3); // 5-7
      const startVal = Math.floor(rng() * 3) * classWidth; // 0, 5, 10 or 0, 10, 20

      const classes: [number, number][] = [];
      for (let c = 0; c < classCount; c++) {
        classes.push([
          startVal + c * classWidth,
          startVal + (c + 1) * classWidth,
        ]);
      }

      // Generate frequencies (sum to a nice total)
      const total = 20 + Math.floor(rng() * 21); // 20-40
      const frequencies: number[] = [];
      let remaining = total;
      for (let c = 0; c < classCount - 1; c++) {
        const maxF = Math.min(remaining - (classCount - c - 1), 12);
        const f = Math.max(1, Math.floor(rng() * maxF) + 1);
        frequencies.push(f);
        remaining -= f;
      }
      frequencies.push(remaining);

      const relativeFrequencies = frequencies.map((f) =>
        roundTo(f / total, 2),
      );
      const cumulativeFrequencies: number[] = [];
      let cumSum = 0;
      for (const f of frequencies) {
        cumSum += f;
        cumulativeFrequencies.push(cumSum);
      }

      // Hide 2-3 values for student to fill in
      const hiddenCount = 2 + Math.floor(rng() * 2);
      const hiddenIndices: number[] = [];
      while (hiddenIndices.length < hiddenCount) {
        const idx = Math.floor(rng() * classCount);
        if (!hiddenIndices.includes(idx)) {
          hiddenIndices.push(idx);
        }
      }

      problems.push({
        mode: "frequency",
        classes,
        frequencies,
        relativeFrequencies,
        cumulativeFrequencies,
        total,
        hiddenIndices,
      });
    }
  }
  return problems;
};

/* ---- helpers ---- */

const roundTo = (n: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
};
