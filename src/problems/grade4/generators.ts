import { mulberry32 } from "../random";
import { numberToKanji } from "../shared/math-utils";

/* ================================================================
   Types
   ================================================================ */

export interface MixedCalcProblem {
  display: string;
  answer: number;
}

export interface RoundingProblem {
  question: string;
  answer: string;
}

export interface FracConvProblem {
  question: string;
  answer: string;
  fromWhole?: number;
  fromNum?: number;
  fromDen?: number;
  toWhole?: number;
  toNum?: number;
  toDen?: number;
  direction: "to-mixed" | "to-improper";
}

export interface AreaProblem {
  question: string;
  answer: string;
}

export interface AngleProblem {
  display: string;
  answer: number;
}

export interface TextProblem {
  question: string;
  answer: string;
}

export interface PatternTableProblem {
  label: string;
  xValues: number[];
  yValues: (number | null)[];
  answers: number[];
  rule: string;
}

export interface CrossTableProblem {
  title: string;
  rowLabels: string[];
  colLabels: string[];
  cells: (number | null)[][];
  answers: number[];
}

/* ================================================================
   Existing generators
   ================================================================ */

export function generateMixedCalc(
  seed: number,
  withParen: boolean,
): MixedCalcProblem[] {
  const rng = mulberry32(seed);
  const problems: MixedCalcProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const useParen = withParen && rng() < 0.5;

    if (useParen) {
      const leftParen = rng() < 0.5;
      if (leftParen) {
        const op2IsMul = rng() < 0.5;
        if (op2IsMul) {
          const c = 2 + Math.floor(rng() * 8);
          const useAdd = rng() < 0.5;
          if (useAdd) {
            const a = 1 + Math.floor(rng() * 20);
            const b = 1 + Math.floor(rng() * 20);
            const ans = (a + b) * c;
            problems.push({ display: `(${a} ＋ ${b}) × ${c}`, answer: ans });
          } else {
            const b = 1 + Math.floor(rng() * 15);
            const a = b + 1 + Math.floor(rng() * 15);
            const ans = (a - b) * c;
            problems.push({ display: `(${a} − ${b}) × ${c}`, answer: ans });
          }
        } else {
          const c = 2 + Math.floor(rng() * 8);
          const quot = 1 + Math.floor(rng() * 10);
          const sum = quot * c;
          const useAdd = rng() < 0.5;
          if (useAdd) {
            const a = 1 + Math.floor(rng() * (sum - 1));
            const b = sum - a;
            if (b > 0) {
              problems.push({ display: `(${a} ＋ ${b}) ÷ ${c}`, answer: quot });
            }
          } else {
            const b = 1 + Math.floor(rng() * 20);
            const a = sum + b;
            problems.push({ display: `(${a} − ${b}) ÷ ${c}`, answer: quot });
          }
        }
      } else {
        const op2IsMul = rng() < 0.5;
        if (op2IsMul) {
          const a = 2 + Math.floor(rng() * 8);
          const useAdd = rng() < 0.5;
          if (useAdd) {
            const b = 1 + Math.floor(rng() * 15);
            const c = 1 + Math.floor(rng() * 15);
            const ans = a * (b + c);
            problems.push({ display: `${a} × (${b} ＋ ${c})`, answer: ans });
          } else {
            const c = 1 + Math.floor(rng() * 10);
            const b = c + 1 + Math.floor(rng() * 15);
            const ans = a * (b - c);
            problems.push({ display: `${a} × (${b} − ${c})`, answer: ans });
          }
        } else {
          const b = 2 + Math.floor(rng() * 8);
          const c = 2 + Math.floor(rng() * 8);
          const inner = b * c;
          const a = inner + 1 + Math.floor(rng() * 50);
          const ans = a - inner;
          problems.push({ display: `${a} − (${b} × ${c})`, answer: ans });
        }
      }
    } else {
      const pattern = Math.floor(rng() * 4);
      switch (pattern) {
        case 0: {
          const b = 2 + Math.floor(rng() * 9);
          const c = 2 + Math.floor(rng() * 9);
          const a = 1 + Math.floor(rng() * 50);
          problems.push({ display: `${a} ＋ ${b} × ${c}`, answer: a + b * c });
          break;
        }
        case 1: {
          const b = 2 + Math.floor(rng() * 5);
          const c = 2 + Math.floor(rng() * 5);
          const prod = b * c;
          const a = prod + 1 + Math.floor(rng() * 50);
          problems.push({ display: `${a} − ${b} × ${c}`, answer: a - prod });
          break;
        }
        case 2: {
          const a = 2 + Math.floor(rng() * 9);
          const b = 2 + Math.floor(rng() * 9);
          const c = 1 + Math.floor(rng() * 50);
          problems.push({ display: `${a} × ${b} ＋ ${c}`, answer: a * b + c });
          break;
        }
        default: {
          const a = 2 + Math.floor(rng() * 9);
          const b = 2 + Math.floor(rng() * 9);
          const prod = a * b;
          const c = 1 + Math.floor(rng() * (prod - 1));
          problems.push({ display: `${a} × ${b} − ${c}`, answer: prod - c });
          break;
        }
      }
    }
  }
  while (problems.length < 12) {
    const a = 2 + Math.floor(rng() * 9);
    const b = 2 + Math.floor(rng() * 9);
    const c = 1 + Math.floor(rng() * 50);
    problems.push({ display: `${a} × ${b} ＋ ${c}`, answer: a * b + c });
  }
  return problems.slice(0, 12);
}

export function generateRounding(
  seed: number,
  digits: number,
): RoundingProblem[] {
  const rng = mulberry32(seed);
  const problems: RoundingProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const numDigits = 3 + Math.floor(rng() * digits);
    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits) - 1;
    const n = min + Math.floor(rng() * (max - min + 1));

    const positions = ["十の位", "百の位", "千の位"];
    const posIdx = Math.min(Math.floor(rng() * numDigits - 1), positions.length - 1);
    const pos = positions[Math.max(0, posIdx)];

    let divisor: number;
    switch (pos) {
      case "十の位": divisor = 10; break;
      case "百の位": divisor = 100; break;
      default: divisor = 1000; break;
    }
    const rounded = Math.round(n / divisor) * divisor;

    problems.push({
      question: `${n} を${pos}までの概数にしなさい`,
      answer: String(rounded),
    });
  }
  return problems;
}

export function generateFracConv(
  seed: number,
  direction: "to-mixed" | "to-improper" | "both",
): FracConvProblem[] {
  const rng = mulberry32(seed);
  const problems: FracConvProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const dir = direction === "both"
      ? (rng() < 0.5 ? "to-mixed" : "to-improper")
      : direction;

    const den = 2 + Math.floor(rng() * 9);
    const whole = 1 + Math.floor(rng() * 5);
    const partNum = 1 + Math.floor(rng() * (den - 1));
    const improperNum = whole * den + partNum;

    if (dir === "to-mixed") {
      problems.push({
        question: `${improperNum}/${den} を帯分数にしなさい`,
        answer: `${whole}と${partNum}/${den}`,
        fromNum: improperNum, fromDen: den,
        toWhole: whole, toNum: partNum, toDen: den,
        direction: "to-mixed",
      });
    } else {
      problems.push({
        question: `${whole}と${partNum}/${den} を仮分数にしなさい`,
        answer: `${improperNum}/${den}`,
        fromWhole: whole, fromNum: partNum, fromDen: den,
        toNum: improperNum, toDen: den,
        direction: "to-improper",
      });
    }
  }
  return problems;
}

export function generateArea(
  seed: number,
  shape: "square" | "rect" | "mixed",
): AreaProblem[] {
  const rng = mulberry32(seed);
  const problems: AreaProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const useSquare = shape === "square" ? true : shape === "rect" ? false : rng() < 0.4;
    const reverse = rng() < 0.3;

    if (useSquare) {
      const side = 2 + Math.floor(rng() * 18);
      const area = side * side;
      if (reverse) {
        problems.push({
          question: `面積が${area}cm²の正方形の一辺の長さは？`,
          answer: `${side}cm`,
        });
      } else {
        problems.push({
          question: `一辺${side}cmの正方形の面積は？`,
          answer: `${area}cm²`,
        });
      }
    } else {
      const w = 2 + Math.floor(rng() * 15);
      const h = 2 + Math.floor(rng() * 15);
      const area = w * h;
      if (reverse) {
        problems.push({
          question: `面積が${area}cm²、たて${h}cmの長方形のよこは？`,
          answer: `${w}cm`,
        });
      } else {
        problems.push({
          question: `たて${h}cm、よこ${w}cmの長方形の面積は？`,
          answer: `${area}cm²`,
        });
      }
    }
  }
  return problems;
}

export function generateAngle(seed: number): AngleProblem[] {
  const rng = mulberry32(seed);
  const problems: AngleProblem[] = [];
  const baseAngles = [30, 45, 60, 90, 120, 135, 150];

  for (let i = 0; i < 10; i++) {
    const type = Math.floor(rng() * 3);
    switch (type) {
      case 0: {
        const x = baseAngles[Math.floor(rng() * baseAngles.length)];
        problems.push({ display: `180° − ${x}°`, answer: 180 - x });
        break;
      }
      case 1: {
        const x = baseAngles[Math.floor(rng() * baseAngles.length)];
        const y = baseAngles[Math.floor(rng() * baseAngles.length)];
        if (x + y <= 360) {
          problems.push({ display: `${x}° ＋ ${y}°`, answer: x + y });
        } else {
          problems.push({ display: `${x}° ＋ ${30}°`, answer: x + 30 });
        }
        break;
      }
      default: {
        const x = 90 + baseAngles[Math.floor(rng() * 4)];
        problems.push({ display: `360° − ${x}°`, answer: 360 - x });
        break;
      }
    }
  }
  return problems;
}

/* ================================================================
   NEW generators
   ================================================================ */

/* ---- area-unit ---- */
export function generateAreaUnit(
  seed: number,
  unitType: "cm-m" | "m-ha" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const sub = unitType === "mixed"
      ? (rng() < 0.5 ? "cm-m" : "m-ha")
      : unitType;

    if (sub === "cm-m") {
      const type = Math.floor(rng() * 2);
      if (type === 0) {
        const m2 = 1 + Math.floor(rng() * 9);
        problems.push({ question: `${m2}m² ＝ □cm²`, answer: `${m2 * 10000}` });
      } else {
        const cm2 = (1 + Math.floor(rng() * 9)) * 10000;
        problems.push({ question: `${cm2}cm² ＝ □m²`, answer: `${cm2 / 10000}` });
      }
    } else {
      const type = Math.floor(rng() * 4);
      switch (type) {
        case 0: {
          const ha = 1 + Math.floor(rng() * 9);
          problems.push({ question: `${ha}ha ＝ □m²`, answer: `${ha * 10000}` });
          break;
        }
        case 1: {
          const m2 = (1 + Math.floor(rng() * 9)) * 10000;
          problems.push({ question: `${m2}m² ＝ □ha`, answer: `${m2 / 10000}` });
          break;
        }
        case 2: {
          const a = (1 + Math.floor(rng() * 9)) * 10;
          problems.push({ question: `${a}a ＝ □m²`, answer: `${a * 100}` });
          break;
        }
        default: {
          const km2 = 1 + Math.floor(rng() * 5);
          problems.push({ question: `${km2}km² ＝ □ha`, answer: `${km2 * 100}` });
          break;
        }
      }
    }
  }
  return problems;
}

/* ---- estimate ---- */
export function generateEstimate(
  seed: number,
  roundTo: number,
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const ops: ("+" | "−" | "×")[] = ["+", "−", "×"];

  for (let i = 0; i < 10; i++) {
    const op = ops[Math.floor(rng() * ops.length)];
    const a = (1 + Math.floor(rng() * 9)) * roundTo + Math.floor(rng() * roundTo);
    let b = (1 + Math.floor(rng() * 9)) * roundTo + Math.floor(rng() * roundTo);

    if (op === "−") {
      b = Math.min(b, a - 1);
      if (b < 1) b = 1 + Math.floor(rng() * (a - 1));
    }

    const aRound = Math.round(a / roundTo) * roundTo;
    const bRound = Math.round(b / roundTo) * roundTo;

    let answer: number;
    let opStr: string;
    switch (op) {
      case "+": answer = aRound + bRound; opStr = "＋"; break;
      case "−": answer = aRound - bRound; opStr = "−"; break;
      default: answer = aRound * bRound; opStr = "×"; break;
    }

    problems.push({
      question: `${a} ${opStr} ${b} をそれぞれ${roundTo === 10 ? "十" : "百"}の位までの概数にして見積もりなさい`,
      answer: `${aRound} ${opStr} ${bRound} ＝ ${answer}`,
    });
  }
  return problems;
}

/* ---- decimal-place ---- */
export function generateDecimalPlace(
  seed: number,
  mode: "count" | "multiply" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const sub = mode === "mixed" ? (rng() < 0.5 ? "count" : "multiply") : mode;

    if (sub === "count") {
      // "0.1が23個で□" or "4.7は0.1が□個"
      const count = 1 + Math.floor(rng() * 99);
      const val = count / 10;
      if (rng() < 0.5) {
        problems.push({ question: `0.1が${count}個で□`, answer: `${val}` });
      } else {
        problems.push({ question: `${val}は0.1が□個`, answer: `${count}` });
      }
    } else {
      // "3.2の10倍は□" or "3.2の1/10は□"
      const base = Math.round((1 + rng() * 98) * 10) / 100;
      const baseStr = base.toFixed(1);
      if (rng() < 0.5) {
        const mul = [10, 100][Math.floor(rng() * 2)];
        const result = base * mul;
        problems.push({ question: `${baseStr}の${mul}倍は？`, answer: `${result}` });
      } else {
        const result = base / 10;
        const resultStr = Number(result.toFixed(2)).toString();
        problems.push({ question: `${baseStr}の1/10は？`, answer: resultStr });
      }
    }
  }
  return problems;
}

/* ---- div-check ---- */
export function generateDivCheck(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const divisor = 2 + Math.floor(rng() * 8); // 2-9
    const quotient = 1 + Math.floor(rng() * 20);
    const remainder = Math.floor(rng() * divisor); // 0 to divisor-1
    const dividend = divisor * quotient + remainder;

    if (remainder === 0) {
      problems.push({
        question: `${dividend} ÷ ${divisor} ＝ ${quotient} を確かめなさい`,
        answer: `${divisor} × ${quotient} ＝ ${dividend}`,
      });
    } else {
      problems.push({
        question: `${dividend} ÷ ${divisor} ＝ ${quotient} あまり ${remainder} を確かめなさい`,
        answer: `${divisor} × ${quotient} ＋ ${remainder} ＝ ${dividend}`,
      });
    }
  }
  return problems;
}

/* ---- large-num4 ---- */
export function generateLargeNum4(
  seed: number,
  mode: "read" | "position" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const sub = mode === "mixed" ? (rng() < 0.5 ? "read" : "position") : mode;

    if (sub === "read") {
      // Large numbers with 億・兆
      const scale = rng() < 0.5 ? 1e8 : 1e12; // 億 or 兆
      const n = (1 + Math.floor(rng() * 9)) * scale
        + Math.floor(rng() * 10000) * (scale / 10000);
      const rounded = Math.round(n / 10000) * 10000;
      const kanji = numberToKanji(rounded);
      if (rng() < 0.5) {
        problems.push({ question: kanji, answer: String(rounded) });
      } else {
        problems.push({ question: String(rounded), answer: kanji });
      }
    } else {
      // Position questions: "5億は1億が□個"
      const units = [
        { val: 1e8, name: "一億" },
        { val: 1e4, name: "一万" },
        { val: 1e12, name: "一兆" },
      ];
      const u = units[Math.floor(rng() * units.length)];
      const count = 1 + Math.floor(rng() * 9);
      const n = count * u.val;
      const nKanji = numberToKanji(n);
      problems.push({ question: `${nKanji}は${u.name}が□個`, answer: `${count}` });
    }
  }
  return problems;
}

/* ---- calc-trick ---- */
export function generateCalcTrick(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const patterns = [
    // 25 × N: use 25 × 4 = 100
    () => {
      const n = 4 * (1 + Math.floor(rng() * 25));
      return { question: `25 × ${n} をくふうして計算しなさい`, answer: `${25 * n}` };
    },
    // 99 × N: (100-1) × N
    () => {
      const n = 2 + Math.floor(rng() * 20);
      return { question: `99 × ${n} をくふうして計算しなさい`, answer: `${99 * n}` };
    },
    // 101 × N: (100+1) × N
    () => {
      const n = 2 + Math.floor(rng() * 20);
      return { question: `101 × ${n} をくふうして計算しなさい`, answer: `${101 * n}` };
    },
    // a × b + a × c = a × (b+c)
    () => {
      const a = 2 + Math.floor(rng() * 8);
      const b = 10 + Math.floor(rng() * 30);
      const c = 10 + Math.floor(rng() * 30);
      return {
        question: `${a} × ${b} ＋ ${a} × ${c} をくふうして計算しなさい`,
        answer: `${a * (b + c)}`,
      };
    },
  ];

  for (let i = 0; i < 8; i++) {
    const pat = patterns[Math.floor(rng() * patterns.length)];
    problems.push(pat());
  }
  return problems;
}

/* ---- pattern-table ---- */
export function generatePatternTable(seed: number): PatternTableProblem[] {
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
}

/* ---- line-graph ---- */
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

/* ---- cross-table ---- */
export function generateCrossTable(seed: number): CrossTableProblem[] {
  const rng = mulberry32(seed);
  const problems: CrossTableProblem[] = [];

  const settings = [
    { title: "好きな遊びしらべ", rows: ["男子", "女子"], cols: ["ドッジボール", "おにごっこ", "なわとび"] },
    { title: "読書冊数しらべ", rows: ["1組", "2組"], cols: ["物語", "図鑑", "まんが"] },
    { title: "通学方法しらべ", rows: ["男子", "女子"], cols: ["歩き", "バス", "車"] },
    { title: "好きな季節しらべ", rows: ["男子", "女子"], cols: ["春", "夏", "秋", "冬"] },
  ];

  for (let t = 0; t < 4; t++) {
    const s = settings[t];
    const nrows = s.rows.length;
    const ncols = s.cols.length;

    // generate data
    const data: number[][] = [];
    for (let r = 0; r < nrows; r++) {
      const row: number[] = [];
      for (let c = 0; c < ncols; c++) {
        row.push(1 + Math.floor(rng() * 15));
      }
      data.push(row);
    }

    // add row totals and col totals
    const rowTotals = data.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals: number[] = [];
    for (let c = 0; c < ncols; c++) {
      colTotals.push(data.reduce((sum, row) => sum + row[c], 0));
    }
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

    // build cells with totals: rows + "合計", cols + "合計"
    const fullRows = [...s.rows, "合計"];
    const fullCols = [...s.cols, "合計"];
    const cells: (number | null)[][] = [];
    for (let r = 0; r <= nrows; r++) {
      const row: (number | null)[] = [];
      for (let c = 0; c <= ncols; c++) {
        if (r < nrows && c < ncols) row.push(data[r][c]);
        else if (r < nrows && c === ncols) row.push(rowTotals[r]);
        else if (r === nrows && c < ncols) row.push(colTotals[c]);
        else row.push(grandTotal);
      }
      cells.push(row);
    }

    // blank some cells (pick 3-4 from totals row/col)
    const blankPositions: [number, number][] = [];
    const totalCells: [number, number][] = [];
    for (let c = 0; c <= ncols; c++) totalCells.push([nrows, c]);
    for (let r = 0; r < nrows; r++) totalCells.push([r, ncols]);

    // shuffle and pick
    for (let j = totalCells.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [totalCells[j], totalCells[k]] = [totalCells[k], totalCells[j]];
    }
    const numBlanks = 3 + Math.floor(rng() * 2);
    for (let j = 0; j < Math.min(numBlanks, totalCells.length); j++) {
      blankPositions.push(totalCells[j]);
    }

    const answers: number[] = [];
    for (const [r, c] of blankPositions) {
      answers.push(cells[r][c] as number);
      cells[r][c] = null;
    }

    problems.push({ title: s.title, rowLabels: fullRows, colLabels: fullCols, cells, answers });
  }
  return problems;
}
