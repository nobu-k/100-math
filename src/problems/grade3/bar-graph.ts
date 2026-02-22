import { mulberry32 } from "../random";

export interface BarGraphProblem {
  title: string;
  categories: string[];
  values: number[];
  unit: string;
  scaleMax: number;
  scaleStep: number;
  questions: { question: string; answer: string }[];
}

export const BAR_CATEGORIES = [
  ["りんご", "みかん", "バナナ", "ぶどう", "いちご", "もも"],
  ["国語", "算数", "理科", "社会", "体育", "音楽"],
  ["1組", "2組", "3組", "4組", "5組", "6組"],
];
export const BAR_TITLES = ["好きな果物", "好きな教科", "クラス別の人数"];

export const generateBarGraph = (
  seed: number,
  bars: number,
): BarGraphProblem[] => {
  const rng = mulberry32(seed);
  const problems: BarGraphProblem[] = [];

  for (let t = 0; t < 3; t++) {
    const setIdx = Math.floor(rng() * BAR_CATEGORIES.length);
    const pool = BAR_CATEGORIES[setIdx];
    const title = BAR_TITLES[setIdx];

    const indices: number[] = [];
    const available = Array.from({ length: pool.length }, (_, i) => i);
    for (let i = 0; i < bars && available.length > 0; i++) {
      const idx = Math.floor(rng() * available.length);
      indices.push(available[idx]);
      available.splice(idx, 1);
    }
    const categories = indices.map(i => pool[i]);

    // scale: step of 2, 5 or 10
    const steps = [2, 5, 10];
    const step = steps[Math.floor(rng() * steps.length)];
    const maxMult = 3 + Math.floor(rng() * 6); // 3-8 scale marks
    const scaleMax = step * maxMult;

    const values = categories.map(() => 1 + Math.floor(rng() * (scaleMax - 1)));

    const questions: { question: string; answer: string }[] = [];

    // Q1: read a value
    const qi = Math.floor(rng() * categories.length);
    questions.push({ question: `${categories[qi]}は何人ですか？`, answer: `${values[qi]}人` });

    // Q2: most popular
    const maxVal = Math.max(...values);
    const maxCat = categories[values.indexOf(maxVal)];
    questions.push({ question: `いちばん多いのは何ですか？`, answer: maxCat });

    // Q3: difference
    if (categories.length >= 2) {
      const a = Math.floor(rng() * categories.length);
      let b = Math.floor(rng() * (categories.length - 1));
      if (b >= a) b++;
      const diff = Math.abs(values[a] - values[b]);
      questions.push({
        question: `${categories[a]}と${categories[b]}のちがいは何人ですか？`,
        answer: `${diff}人`,
      });
    }

    problems.push({ title, categories, values, unit: "人", scaleMax, scaleStep: step, questions });
  }
  return problems;
};
