import { mulberry32 } from "../random";
import { numberToKanji } from "../shared/math-utils";

/* ================================================================
   Types
   ================================================================ */

export interface KukuBlankProblem {
  a: number;
  b: number;
  product: number;
  blankPos: "a" | "b" | "product";
  answer: number;
}

export interface MushikuiProblem {
  left: number | null;
  right: number | null;
  result: number | null;
  op: "+" | "−";
  answer: number;
}

export interface TextProblem {
  question: string;
  answer: string;
}

export interface TableReadProblem {
  title: string;
  categories: string[];
  values: number[];
  questions: { question: string; answer: string }[];
}

/* ================================================================
   Generators
   ================================================================ */

export function generateKukuBlank(
  seed: number,
  blankMode: "any" | "product" | "factor",
): KukuBlankProblem[] {
  const rng = mulberry32(seed);
  const problems: KukuBlankProblem[] = [];
  for (let i = 0; i < 15; i++) {
    const a = 1 + Math.floor(rng() * 9);
    const b = 1 + Math.floor(rng() * 9);
    const product = a * b;
    let blankPos: "a" | "b" | "product";
    if (blankMode === "product") {
      blankPos = "product";
    } else if (blankMode === "factor") {
      blankPos = rng() < 0.5 ? "a" : "b";
    } else {
      const r = rng();
      blankPos = r < 0.33 ? "a" : r < 0.66 ? "b" : "product";
    }
    const answer = blankPos === "a" ? a : blankPos === "b" ? b : product;
    problems.push({ a, b, product, blankPos, answer });
  }
  return problems;
}

export function generateMushikui(
  seed: number,
  max: number,
  mode: "add" | "sub" | "mixed",
): MushikuiProblem[] {
  const rng = mulberry32(seed);
  const problems: MushikuiProblem[] = [];
  for (let i = 0; i < 12; i++) {
    const useAdd = mode === "add" ? true : mode === "sub" ? false : rng() < 0.5;
    if (useAdd) {
      const result = 10 + Math.floor(rng() * (max - 9));
      const left = 1 + Math.floor(rng() * (result - 1));
      const right = result - left;
      const r = rng();
      if (r < 0.33) {
        problems.push({ left: null, right, result, op: "+", answer: left });
      } else if (r < 0.66) {
        problems.push({ left, right: null, result, op: "+", answer: right });
      } else {
        problems.push({ left, right, result: null, op: "+", answer: result });
      }
    } else {
      const left = 10 + Math.floor(rng() * (max - 9));
      const right = 1 + Math.floor(rng() * (left - 1));
      const result = left - right;
      const r = rng();
      if (r < 0.33) {
        problems.push({ left: null, right, result, op: "−", answer: left });
      } else if (r < 0.66) {
        problems.push({ left, right: null, result, op: "−", answer: right });
      } else {
        problems.push({ left, right, result: null, op: "−", answer: result });
      }
    }
  }
  return problems;
}

export function generateUnitConv(
  seed: number,
  unitType: "length" | "volume" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const makeLengthProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const cm = 1 + Math.floor(rng() * 9);
        const mm = 1 + Math.floor(rng() * 9);
        return { question: `${cm}cm ${mm}mm ＝ □mm`, answer: `${cm * 10 + mm}` };
      }
      case 1: {
        const cm = 1 + Math.floor(rng() * 9);
        const mm = 1 + Math.floor(rng() * 9);
        const total = cm * 10 + mm;
        return { question: `${total}mm ＝ □cm □mm`, answer: `${cm}cm ${mm}mm` };
      }
      case 2: {
        const m = 1 + Math.floor(rng() * 5);
        const cm = 1 + Math.floor(rng() * 99);
        return { question: `${m}m ${cm}cm ＝ □cm`, answer: `${m * 100 + cm}` };
      }
      default: {
        const m = 1 + Math.floor(rng() * 5);
        const cm = 1 + Math.floor(rng() * 99);
        const total = m * 100 + cm;
        return { question: `${total}cm ＝ □m □cm`, answer: `${m}m ${cm}cm` };
      }
    }
  };

  const makeVolumeProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const l = 1 + Math.floor(rng() * 5);
        const dl = 1 + Math.floor(rng() * 9);
        return { question: `${l}L ${dl}dL ＝ □dL`, answer: `${l * 10 + dl}` };
      }
      case 1: {
        const l = 1 + Math.floor(rng() * 5);
        const dl = 1 + Math.floor(rng() * 9);
        const total = l * 10 + dl;
        return { question: `${total}dL ＝ □L □dL`, answer: `${l}L ${dl}dL` };
      }
      case 2: {
        const l = 1 + Math.floor(rng() * 3);
        const ml = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${l}L ${ml}mL ＝ □mL`, answer: `${l * 1000 + ml}` };
      }
      default: {
        const l = 1 + Math.floor(rng() * 3);
        const ml = (1 + Math.floor(rng() * 9)) * 100;
        const total = l * 1000 + ml;
        return { question: `${total}mL ＝ □L □mL`, answer: `${l}L ${ml}mL` };
      }
    }
  };

  for (let i = 0; i < 10; i++) {
    if (unitType === "length") {
      problems.push(makeLengthProblem());
    } else if (unitType === "volume") {
      problems.push(makeVolumeProblem());
    } else {
      problems.push(rng() < 0.5 ? makeLengthProblem() : makeVolumeProblem());
    }
  }
  return problems;
}

export function generateTimeCalc(
  seed: number,
  calcType: "after" | "duration" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 8; i++) {
    const useAfter =
      calcType === "after" ? true : calcType === "duration" ? false : rng() < 0.5;

    if (useAfter) {
      const hour = 1 + Math.floor(rng() * 10);
      const minute = Math.floor(rng() * 6) * 10;
      const addMin = (1 + Math.floor(rng() * 5)) * 10;
      let newHour = hour;
      let newMin = minute + addMin;
      if (newMin >= 60) {
        newHour += Math.floor(newMin / 60);
        newMin = newMin % 60;
      }
      const timeStr = minute === 0 ? `${hour}時` : `${hour}時${minute}分`;
      const ansStr = newMin === 0 ? `${newHour}時` : `${newHour}時${newMin}分`;
      problems.push({
        question: `${timeStr}の${addMin}分後は何時何分？`,
        answer: ansStr,
      });
    } else {
      const startHour = 1 + Math.floor(rng() * 9);
      const startMin = Math.floor(rng() * 4) * 15;
      const endHour = startHour + 1 + Math.floor(rng() * 2);
      const endMin = Math.floor(rng() * 4) * 15;
      let diffH = endHour - startHour;
      let diffM = endMin - startMin;
      if (diffM < 0) { diffH -= 1; diffM += 60; }
      const startStr = startMin === 0 ? `${startHour}時` : `${startHour}時${startMin}分`;
      const endStr = endMin === 0 ? `${endHour}時` : `${endHour}時${endMin}分`;
      let ansStr: string;
      if (diffH === 0) ansStr = `${diffM}分`;
      else if (diffM === 0) ansStr = `${diffH}時間`;
      else ansStr = `${diffH}時間${diffM}分`;
      problems.push({ question: `${startStr}から${endStr}まで何時間何分？`, answer: ansStr });
    }
  }
  return problems;
}

export function generateLargeNum(
  seed: number,
  maxRange: number,
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];
  const minVal = maxRange <= 100 ? 10 : maxRange <= 1000 ? 100 : 1000;

  for (let i = 0; i < 10; i++) {
    const n = minVal + Math.floor(rng() * (maxRange - minVal));
    const kanji = numberToKanji(n);
    if (rng() < 0.5) {
      problems.push({ question: String(n), answer: kanji });
    } else {
      problems.push({ question: kanji, answer: String(n) });
    }
  }
  return problems;
}

/* ---- NEW: table-read ---- */

const FRUIT_NAMES = ["りんご", "みかん", "バナナ", "ぶどう", "いちご", "もも", "メロン"];
const ANIMAL_NAMES = ["いぬ", "ねこ", "うさぎ", "ハムスター", "きんぎょ", "かめ", "ことり"];
const SPORT_NAMES = ["サッカー", "野球", "水泳", "バスケ", "テニス", "卓球", "バレー"];
const CATEGORY_SETS = [FRUIT_NAMES, ANIMAL_NAMES, SPORT_NAMES];
const CATEGORY_TITLES = ["好きな果物しらべ", "好きな動物しらべ", "好きなスポーツしらべ"];

export function generateTableRead(
  seed: number,
  categories: number,
): TableReadProblem[] {
  const rng = mulberry32(seed);
  const problems: TableReadProblem[] = [];

  for (let t = 0; t < 3; t++) {
    const setIdx = Math.floor(rng() * CATEGORY_SETS.length);
    const namePool = CATEGORY_SETS[setIdx];
    const title = CATEGORY_TITLES[setIdx];

    // pick `categories` names without replacement
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

    // Q1: how many for a specific item?
    const qi = Math.floor(rng() * cats.length);
    questions.push({ question: `${cats[qi]}は何人ですか？`, answer: `${values[qi]}人` });

    // Q2: which is the most popular?
    const maxVal = Math.max(...values);
    const maxCat = cats[values.indexOf(maxVal)];
    questions.push({ question: `いちばん多いのは何ですか？`, answer: maxCat });

    // Q3: total
    questions.push({ question: `合計は何人ですか？`, answer: `${total}人` });

    // Q4: difference between two items
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

    // Q5: which is the least popular?
    const minVal = Math.min(...values);
    const minCat = cats[values.indexOf(minVal)];
    questions.push({ question: `いちばん少ないのは何ですか？`, answer: minCat });

    problems.push({ title, categories: cats, values, questions });
  }
  return problems;
}
