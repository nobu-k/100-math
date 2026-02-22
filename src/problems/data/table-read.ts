import { mulberry32 } from "../random";

export interface TableReadProblem {
  title: string;
  categories: string[];
  values: number[];
  questions: { question: string; answer: string }[];
}

const FRUIT_NAMES = ["りんご", "みかん", "バナナ", "ぶどう", "いちご", "もも", "メロン"];
const ANIMAL_NAMES = ["いぬ", "ねこ", "うさぎ", "ハムスター", "きんぎょ", "かめ", "ことり"];
const SPORT_NAMES = ["サッカー", "野球", "水泳", "バスケ", "テニス", "卓球", "バレー"];
const CATEGORY_SETS = [FRUIT_NAMES, ANIMAL_NAMES, SPORT_NAMES];
const CATEGORY_TITLES = ["好きな果物しらべ", "好きな動物しらべ", "好きなスポーツしらべ"];

export const generateTableRead = (
  seed: number,
  categories: number,
): TableReadProblem[] => {
  const rng = mulberry32(seed);
  const problems: TableReadProblem[] = [];

  for (let t = 0; t < 3; t++) {
    const setIdx = Math.floor(rng() * CATEGORY_SETS.length);
    const namePool = CATEGORY_SETS[setIdx];
    const title = CATEGORY_TITLES[setIdx];

    const indices: number[] = [];
    const pool = Array.from({ length: namePool.length }, (_, i) => i);
    for (let i = 0; i < categories && pool.length > 0; i++) {
      const idx = Math.floor(rng() * pool.length);
      indices.push(pool[idx]);
      pool.splice(idx, 1);
    }
    const cats = indices.map(i => namePool[i]);
    const values = cats.map(() => 1 + Math.floor(rng() * 15));
    const total = values.reduce((a, b) => a + b, 0);

    const questions: { question: string; answer: string }[] = [];

    const qi = Math.floor(rng() * cats.length);
    questions.push({ question: `${cats[qi]}は何人ですか？`, answer: `${values[qi]}人` });

    const maxVal = Math.max(...values);
    const maxCat = cats[values.indexOf(maxVal)];
    questions.push({ question: `いちばん多いのは何ですか？`, answer: maxCat });

    questions.push({ question: `合計は何人ですか？`, answer: `${total}人` });

    if (cats.length >= 2) {
      const a = Math.floor(rng() * cats.length);
      let b = Math.floor(rng() * (cats.length - 1));
      if (b >= a) b++;
      const diff = Math.abs(values[a] - values[b]);
      questions.push({
        question: `${cats[a]}と${cats[b]}のちがいは何人ですか？`,
        answer: `${diff}人`,
      });
    }

    const minVal = Math.min(...values);
    const minCat = cats[values.indexOf(minVal)];
    questions.push({ question: `いちばん少ないのは何ですか？`, answer: minCat });

    problems.push({ title, categories: cats, values, questions });
  }
  return problems;
};
