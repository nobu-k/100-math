import { mulberry32 } from "../random";

export interface PatternTableProblem {
  label: string;
  xValues: number[];
  yValues: (number | null)[];
  answers: number[];
  rule: string;
}

export const generatePatternTable = (seed: number): PatternTableProblem[] => {
  const rng = mulberry32(seed);
  const problems: PatternTableProblem[] = [];

  const labels = [
    "正方形の数と周りの長さ",
    "段の数とマッチ棒の本数",
    "束の数と鉛筆の本数",
    "時間と距離",
    "枚数と金額",
    "個数と重さ",
  ];

  for (let i = 0; i < 6; i++) {
    const a = 1 + Math.floor(rng() * 9);
    const b = Math.floor(rng() * 5); // 0 for pure y=ax
    const xValues = [1, 2, 3, 4, 5, 6];
    const allY = xValues.map(x => a * x + b);

    // blank 2 values
    const blankSet = new Set<number>();
    while (blankSet.size < 2) {
      blankSet.add(1 + Math.floor(rng() * 4)); // indices 1-4 (not first or last)
    }

    const yValues: (number | null)[] = allY.map((y, idx) =>
      blankSet.has(idx) ? null : y
    );
    const answers = [...blankSet].sort().map(idx => allY[idx]);

    const label = labels[i % labels.length];
    const rule = b === 0 ? `y ＝ ${a} × x` : `y ＝ ${a} × x ＋ ${b}`;

    problems.push({ label, xValues, yValues, answers, rule });
  }
  return problems;
};
