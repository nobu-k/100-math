import { mulberry32 } from "../random";

export interface LineGraphProblem {
  title: string;
  labels: string[];
  values: number[];
  unit: string;
  questions: { question: string; answer: string }[];
}

export function generateLineGraph(seed: number): LineGraphProblem[] {
  const rng = mulberry32(seed);
  const problems: LineGraphProblem[] = [];

  const themes = [
    { title: "気温の変化", labels: ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月"], unit: "℃", min: 5, max: 35 },
    { title: "体重の記録", labels: ["4月", "6月", "8月", "10月", "12月", "2月"], unit: "kg", min: 25, max: 40 },
    { title: "水の温度の変化", labels: ["0分", "1分", "2分", "3分", "4分", "5分", "6分", "7分"], unit: "℃", min: 20, max: 100 },
  ];

  for (let t = 0; t < 3; t++) {
    const theme = themes[t % themes.length];
    // generate trending values
    let val = theme.min + Math.floor(rng() * (theme.max - theme.min) / 2);
    const values: number[] = [];
    for (const _ of theme.labels) {
      values.push(val);
      val += -3 + Math.floor(rng() * 7); // -3 to +3
      val = Math.max(theme.min, Math.min(theme.max, val));
    }

    const questions: { question: string; answer: string }[] = [];

    // Q1: value at a point
    const qi = Math.floor(rng() * theme.labels.length);
    questions.push({
      question: `${theme.labels[qi]}の${theme.title.replace("の変化", "").replace("の記録", "")}は？`,
      answer: `${values[qi]}${theme.unit}`,
    });

    // Q2: highest
    const maxVal = Math.max(...values);
    const maxIdx = values.indexOf(maxVal);
    questions.push({
      question: `いちばん高いのはいつですか？`,
      answer: theme.labels[maxIdx],
    });

    // Q3: change between two consecutive points
    const ci = Math.floor(rng() * (theme.labels.length - 1));
    const diff = values[ci + 1] - values[ci];
    questions.push({
      question: `${theme.labels[ci]}から${theme.labels[ci + 1]}への変化は？`,
      answer: `${diff >= 0 ? "＋" : ""}${diff}${theme.unit}`,
    });

    problems.push({ title: theme.title, labels: theme.labels, values, unit: theme.unit, questions });
  }
  return problems;
}
