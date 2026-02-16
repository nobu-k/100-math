import { mulberry32 } from "../random";
import { numberToKanji } from "../shared/math-utils";

/* ================================================================
   Types
   ================================================================ */

export interface DivisionProblem {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

export interface BoxEqProblem {
  display: string;
  answer: number;
}

export interface MentalMathProblem {
  left: number;
  right: number;
  op: "+" | "−";
  answer: number;
}

export interface TextProblem {
  question: string;
  answer: string;
}

export interface DecimalCompProblem {
  left: string;
  right: string;
  answer: "＞" | "＜" | "＝";
}

export interface BarGraphProblem {
  title: string;
  categories: string[];
  values: number[];
  unit: string;
  scaleMax: number;
  scaleStep: number;
  questions: { question: string; answer: string }[];
}

/* ================================================================
   Generators (existing)
   ================================================================ */

export function generateDivision(
  seed: number,
  remainderMode: "none" | "yes" | "mixed",
): DivisionProblem[] {
  const rng = mulberry32(seed);
  const problems: DivisionProblem[] = [];

  for (let i = 0; i < 15; i++) {
    const divisor = 2 + Math.floor(rng() * 8);
    const useRemainder =
      remainderMode === "none" ? false :
      remainderMode === "yes" ? true :
      rng() < 0.5;

    if (useRemainder) {
      const quotient = 1 + Math.floor(rng() * 9);
      const remainder = 1 + Math.floor(rng() * (divisor - 1));
      const dividend = divisor * quotient + remainder;
      problems.push({ dividend, divisor, quotient, remainder });
    } else {
      const quotient = 1 + Math.floor(rng() * 9);
      const dividend = divisor * quotient;
      problems.push({ dividend, divisor, quotient, remainder: 0 });
    }
  }
  return problems;
}

export function generateBoxEq(
  seed: number,
  ops: "addsub" | "all",
): BoxEqProblem[] {
  const rng = mulberry32(seed);
  const problems: BoxEqProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const useMultDiv = ops === "all" && rng() < 0.5;

    if (useMultDiv) {
      const useMul = rng() < 0.5;
      if (useMul) {
        const a = 2 + Math.floor(rng() * 8);
        const b = 2 + Math.floor(rng() * 8);
        const c = a * b;
        if (rng() < 0.5) {
          problems.push({ display: `□ × ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} × □ ＝ ${c}`, answer: b });
        }
      } else {
        const b = 2 + Math.floor(rng() * 8);
        const c = 1 + Math.floor(rng() * 9);
        const a = b * c;
        if (rng() < 0.5) {
          problems.push({ display: `□ ÷ ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} ÷ □ ＝ ${c}`, answer: b });
        }
      }
    } else {
      const useAdd = rng() < 0.5;
      if (useAdd) {
        const c = 10 + Math.floor(rng() * 90);
        const a = 1 + Math.floor(rng() * (c - 1));
        const b = c - a;
        if (rng() < 0.5) {
          problems.push({ display: `□ ＋ ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} ＋ □ ＝ ${c}`, answer: b });
        }
      } else {
        const a = 10 + Math.floor(rng() * 90);
        const b = 1 + Math.floor(rng() * (a - 1));
        const c = a - b;
        if (rng() < 0.5) {
          problems.push({ display: `□ − ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} − □ ＝ ${c}`, answer: b });
        }
      }
    }
  }
  return problems;
}

export function generateMentalMath(
  seed: number,
  mode: "add" | "sub" | "mixed",
): MentalMathProblem[] {
  const rng = mulberry32(seed);
  const problems: MentalMathProblem[] = [];

  for (let i = 0; i < 20; i++) {
    const useAdd = mode === "add" ? true : mode === "sub" ? false : rng() < 0.5;
    if (useAdd) {
      const left = 10 + Math.floor(rng() * 90);
      const right = 1 + Math.floor(rng() * 99);
      const r = Math.min(right, 200 - left);
      if (r < 1) { continue; }
      problems.push({ left, right: r, op: "+", answer: left + r });
    } else {
      const left = 10 + Math.floor(rng() * 90);
      const right = 1 + Math.floor(rng() * (left - 1));
      problems.push({ left, right, op: "−", answer: left - right });
    }
  }
  return problems.slice(0, 20);
}

export function generateUnitConv3(
  seed: number,
  unitType: "length" | "weight" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const makeLengthProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const km = 1 + Math.floor(rng() * 9);
        const m = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${km}km ${m}m ＝ □m`, answer: `${km * 1000 + m}` };
      }
      case 1: {
        const km = 1 + Math.floor(rng() * 9);
        const m = (1 + Math.floor(rng() * 9)) * 100;
        const total = km * 1000 + m;
        return { question: `${total}m ＝ □km □m`, answer: `${km}km ${m}m` };
      }
      case 2: {
        const m = 1 + Math.floor(rng() * 9);
        const cm = 1 + Math.floor(rng() * 99);
        return { question: `${m}m ${cm}cm ＝ □cm`, answer: `${m * 100 + cm}` };
      }
      default: {
        const m = 1 + Math.floor(rng() * 9);
        const cm = 1 + Math.floor(rng() * 99);
        const total = m * 100 + cm;
        return { question: `${total}cm ＝ □m □cm`, answer: `${m}m ${cm}cm` };
      }
    }
  };

  const makeWeightProblem = (): TextProblem => {
    const type = Math.floor(rng() * 4);
    switch (type) {
      case 0: {
        const kg = 1 + Math.floor(rng() * 9);
        const g = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${kg}kg ${g}g ＝ □g`, answer: `${kg * 1000 + g}` };
      }
      case 1: {
        const kg = 1 + Math.floor(rng() * 9);
        const g = (1 + Math.floor(rng() * 9)) * 100;
        const total = kg * 1000 + g;
        return { question: `${total}g ＝ □kg □g`, answer: `${kg}kg ${g}g` };
      }
      case 2: {
        const t = 1 + Math.floor(rng() * 5);
        const kg = (1 + Math.floor(rng() * 9)) * 100;
        return { question: `${t}t ${kg}kg ＝ □kg`, answer: `${t * 1000 + kg}` };
      }
      default: {
        const t = 1 + Math.floor(rng() * 5);
        const kg = (1 + Math.floor(rng() * 9)) * 100;
        const total = t * 1000 + kg;
        return { question: `${total}kg ＝ □t □kg`, answer: `${t}t ${kg}kg` };
      }
    }
  };

  for (let i = 0; i < 10; i++) {
    if (unitType === "length") {
      problems.push(makeLengthProblem());
    } else if (unitType === "weight") {
      problems.push(makeWeightProblem());
    } else {
      problems.push(rng() < 0.5 ? makeLengthProblem() : makeWeightProblem());
    }
  }
  return problems;
}

export function generateDecimalComp(
  seed: number,
  maxVal: number,
): DecimalCompProblem[] {
  const rng = mulberry32(seed);
  const problems: DecimalCompProblem[] = [];

  for (let i = 0; i < 15; i++) {
    let a: number, b: number;
    if (i < 2) {
      a = Math.round((0.1 + rng() * maxVal) * 10) / 10;
      b = a;
    } else {
      a = Math.round((0.1 + rng() * maxVal) * 10) / 10;
      b = Math.round((0.1 + rng() * maxVal) * 10) / 10;
    }
    const answer: "＞" | "＜" | "＝" = a > b ? "＞" : a < b ? "＜" : "＝";
    problems.push({ left: a.toFixed(1), right: b.toFixed(1), answer });
  }
  return problems;
}

/* ================================================================
   NEW Generators
   ================================================================ */

/* ---- time-calc3 ---- */
export function generateTimeCalc3(
  seed: number,
  mode: "after" | "duration" | "seconds" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 8; i++) {
    const r = rng();
    const subMode = mode === "mixed"
      ? (r < 0.33 ? "after" : r < 0.66 ? "duration" : "seconds")
      : mode;

    if (subMode === "seconds") {
      // seconds conversion / arithmetic
      const min = 1 + Math.floor(rng() * 5);
      const sec = Math.floor(rng() * 60);
      const totalSec = min * 60 + sec;
      if (rng() < 0.5) {
        problems.push({ question: `${min}分${sec}秒 ＝ □秒`, answer: `${totalSec}` });
      } else {
        const m2 = Math.floor(totalSec / 60);
        const s2 = totalSec % 60;
        problems.push({ question: `${totalSec}秒 ＝ □分□秒`, answer: `${m2}分${s2}秒` });
      }
    } else if (subMode === "after") {
      const hour = 1 + Math.floor(rng() * 10);
      const minute = Math.floor(rng() * 4) * 15;
      const addMin = 5 + Math.floor(rng() * 55);
      let newHour = hour;
      let newMin = minute + addMin;
      if (newMin >= 60) {
        newHour += Math.floor(newMin / 60);
        newMin = newMin % 60;
      }
      const timeStr = minute === 0 ? `${hour}時` : `${hour}時${minute}分`;
      const ansStr = newMin === 0 ? `${newHour}時` : `${newHour}時${newMin}分`;
      problems.push({ question: `${timeStr}の${addMin}分後は何時何分？`, answer: ansStr });
    } else {
      // duration
      const startHour = 1 + Math.floor(rng() * 9);
      const startMin = Math.floor(rng() * 12) * 5;
      const durH = Math.floor(rng() * 3);
      const durM = 5 + Math.floor(rng() * 11) * 5;
      const endTotalMin = startHour * 60 + startMin + durH * 60 + durM;
      const endH = Math.floor(endTotalMin / 60);
      const endM = endTotalMin % 60;
      const startStr = startMin === 0 ? `${startHour}時` : `${startHour}時${startMin}分`;
      const endStr = endM === 0 ? `${endH}時` : `${endH}時${endM}分`;
      let ansStr: string;
      if (durH === 0) ansStr = `${durM}分`;
      else if (durM === 0) ansStr = `${durH}時間`;
      else ansStr = `${durH}時間${durM}分`;
      problems.push({ question: `${startStr}から${endStr}まで何時間何分？`, answer: ansStr });
    }
  }
  return problems;
}

/* ---- large-num3 ---- */
export function generateLargeNum3(
  seed: number,
  mode: "read" | "count" | "multiply" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const r = rng();
    const subMode = mode === "mixed"
      ? (r < 0.33 ? "read" : r < 0.66 ? "count" : "multiply")
      : mode;

    if (subMode === "read") {
      // read/write large numbers up to 1億
      const n = (1 + Math.floor(rng() * 9999)) * 10000; // multiples of 10000
      const kanji = numberToKanji(n);
      if (rng() < 0.5) {
        problems.push({ question: String(n), answer: kanji });
      } else {
        problems.push({ question: kanji, answer: String(n) });
      }
    } else if (subMode === "count") {
      // "45000は1000が□個"
      const units = [10, 100, 1000, 10000];
      const unit = units[Math.floor(rng() * units.length)];
      const count = 1 + Math.floor(rng() * 99);
      const n = count * unit;
      const unitKanji = numberToKanji(unit);
      problems.push({ question: `${n}は${unitKanji}が□個`, answer: `${count}` });
    } else {
      // "3200の10倍は□" or "3200の1/10は□"
      const base = (1 + Math.floor(rng() * 99)) * 100;
      if (rng() < 0.5) {
        const mul = [10, 100, 1000][Math.floor(rng() * 3)];
        problems.push({ question: `${base}の${mul}倍は？`, answer: `${base * mul}` });
      } else {
        // ensure divisible
        const divisors = base >= 1000 ? [10, 100] : [10];
        const div = divisors[Math.floor(rng() * divisors.length)];
        problems.push({ question: `${base}の1/${div}は？`, answer: `${base / div}` });
      }
    }
  }
  return problems;
}

/* ---- bar-graph ---- */
const BAR_CATEGORIES = [
  ["りんご", "みかん", "バナナ", "ぶどう", "いちご", "もも"],
  ["国語", "算数", "理科", "社会", "体育", "音楽"],
  ["1組", "2組", "3組", "4組", "5組", "6組"],
];
const BAR_TITLES = ["好きな果物", "好きな教科", "クラス別の人数"];

export function generateBarGraph(
  seed: number,
  bars: number,
): BarGraphProblem[] {
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
}

/* ---- circle-rd ---- */
export function generateCircleRD(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = Math.floor(rng() * 3);
    switch (type) {
      case 0: {
        // radius -> diameter
        const r = 1 + Math.floor(rng() * 20);
        problems.push({ question: `半径${r}cmの円の直径は？`, answer: `${r * 2}cm` });
        break;
      }
      case 1: {
        // diameter -> radius
        const d = 2 + Math.floor(rng() * 10) * 2; // even for integer radius
        problems.push({ question: `直径${d}cmの円の半径は？`, answer: `${d / 2}cm` });
        break;
      }
      default: {
        // given radius, find diameter from description
        const r = 1 + Math.floor(rng() * 15);
        problems.push({
          question: `半径が${r}cmの円があります。直径は半径の何倍ですか？`,
          answer: `2倍`,
        });
        break;
      }
    }
  }
  return problems;
}
