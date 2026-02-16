import { mulberry32 } from "../random";
import { lcm, simplify } from "../shared/math-utils";

/* ================================================================
   Types
   ================================================================ */

export interface TextProblem {
  question: string;
  answer: string;
}

export interface FracCalcProblem {
  aNum: number; aDen: number;
  bNum: number; bDen: number;
  ansNum: number; ansDen: number;
  ansWhole?: number; ansPartNum?: number;
  op: "+" | "−";
}

export interface FracCompareProblem {
  aNum: number; aDen: number;
  bNum: number; bDen: number;
  answer: "＞" | "＜" | "＝";
}

export interface EvenOddProblem {
  numbers: number[];
  evenAnswers: number[];
  oddAnswers: number[];
}

/* ================================================================
   Existing generators
   ================================================================ */

export function generatePercent(
  seed: number,
  find: "ratio" | "compared" | "base" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = find === "mixed"
      ? (["ratio", "compared", "base"] as const)[Math.floor(rng() * 3)]
      : find;

    const base = (2 + Math.floor(rng() * 19)) * 10;
    const pct = (1 + Math.floor(rng() * 19)) * 5;
    const compared = base * pct / 100;

    switch (type) {
      case "ratio":
        problems.push({ question: `${base}人中${compared}人は何%？`, answer: `${pct}%` });
        break;
      case "compared":
        problems.push({ question: `${base}の${pct}%はいくつ？`, answer: `${compared}` });
        break;
      case "base":
        problems.push({ question: `□の${pct}%が${compared}のとき、□はいくつ？`, answer: `${base}` });
        break;
    }
  }
  return problems;
}

export function generateSpeed(
  seed: number,
  find: "speed" | "time" | "distance" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = find === "mixed"
      ? (["speed", "time", "distance"] as const)[Math.floor(rng() * 3)]
      : find;

    const speed = (3 + Math.floor(rng() * 18)) * 10;
    const time = 1 + Math.floor(rng() * 8);
    const distance = speed * time;

    switch (type) {
      case "distance":
        problems.push({ question: `時速${speed}kmで${time}時間走ると何km？`, answer: `${distance}km` });
        break;
      case "time":
        problems.push({ question: `${distance}kmを時速${speed}kmで走ると何時間？`, answer: `${time}時間` });
        break;
      case "speed":
        problems.push({ question: `${distance}kmを${time}時間で走ったときの時速は？`, answer: `時速${speed}km` });
        break;
    }
  }
  return problems;
}

export function generateAreaFormula(
  seed: number,
  shape: "triangle" | "parallelogram" | "trapezoid" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = shape === "mixed"
      ? (["triangle", "parallelogram", "trapezoid"] as const)[Math.floor(rng() * 3)]
      : shape;

    switch (type) {
      case "triangle": {
        const base = 2 + Math.floor(rng() * 18);
        const height = 2 + Math.floor(rng() * 18);
        const b = base % 2 === 0 ? base : base + 1;
        const area = (b * height) / 2;
        problems.push({ question: `底辺${b}cm、高さ${height}cmの三角形の面積は？`, answer: `${area}cm²` });
        break;
      }
      case "parallelogram": {
        const base = 2 + Math.floor(rng() * 18);
        const height = 2 + Math.floor(rng() * 18);
        const area = base * height;
        problems.push({ question: `底辺${base}cm、高さ${height}cmの平行四辺形の面積は？`, answer: `${area}cm²` });
        break;
      }
      case "trapezoid": {
        const upper = 2 + Math.floor(rng() * 10);
        const lower = upper + 2 + Math.floor(rng() * 10);
        const height = 2 + Math.floor(rng() * 14);
        const sum = upper + lower;
        const h = sum % 2 === 0 ? height : (height % 2 === 0 ? height : height + 1);
        const area = (sum * h) / 2;
        problems.push({ question: `上底${upper}cm、下底${lower}cm、高さ${h}cmの台形の面積は？`, answer: `${area}cm²` });
        break;
      }
    }
  }
  return problems;
}

export function generateFracDecimal(
  seed: number,
  direction: "to-decimal" | "to-fraction" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const cleanFracs: [number, number][] = [
    [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
    [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10], [9, 10],
    [1, 20], [3, 20], [7, 20], [9, 20],
    [1, 25], [2, 25], [3, 25], [4, 25],
  ];

  for (let i = 0; i < 10; i++) {
    const dir = direction === "mixed"
      ? (rng() < 0.5 ? "to-decimal" : "to-fraction")
      : direction;

    const [num, den] = cleanFracs[Math.floor(rng() * cleanFracs.length)];
    const decimal = num / den;
    const decStr = decimal % 1 === 0 ? String(decimal) : decimal.toFixed(
      String(decimal).split(".")[1]?.length ?? 1
    );

    if (dir === "to-decimal") {
      problems.push({ question: `${num}/${den} を小数で表しなさい`, answer: decStr });
    } else {
      problems.push({ question: `${decStr} を分数で表しなさい`, answer: `${num}/${den}` });
    }
  }
  return problems;
}

export function generateAverage(
  seed: number,
  count: number,
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 8; i++) {
    const n = count;
    const avg = 50 + Math.floor(rng() * 50);
    const total = avg * n;
    const values: number[] = [];
    let remaining = total;
    for (let j = 0; j < n - 1; j++) {
      const maxVal = Math.min(100, remaining - (n - j - 1));
      const minVal = Math.max(1, remaining - 100 * (n - j - 1));
      const v = minVal + Math.floor(rng() * (maxVal - minVal + 1));
      values.push(v);
      remaining -= v;
    }
    values.push(remaining);

    for (let j = values.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [values[j], values[k]] = [values[k], values[j]];
    }

    problems.push({ question: `${values.join("、")} の平均は？`, answer: `${avg}` });
  }
  return problems;
}

/* ================================================================
   NEW generators
   ================================================================ */

/* ---- diff-frac (異分母分数の加減) ---- */
export function generateDiffFrac(
  seed: number,
  op: "add" | "sub" | "mixed",
): FracCalcProblem[] {
  const rng = mulberry32(seed);
  const problems: FracCalcProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const useAdd = op === "add" ? true : op === "sub" ? false : rng() < 0.5;
    const aDen = 2 + Math.floor(rng() * 9); // 2-10
    let bDen = 2 + Math.floor(rng() * 9);
    // ensure different denominators
    while (bDen === aDen) bDen = 2 + Math.floor(rng() * 9);

    const aNum = 1 + Math.floor(rng() * (aDen - 1)); // proper fraction
    let bNum = 1 + Math.floor(rng() * (bDen - 1));

    const commonDen = lcm(aDen, bDen);
    const aConverted = aNum * (commonDen / aDen);
    const bConverted = bNum * (commonDen / bDen);

    let rawNum: number;
    const opSym: "+" | "−" = useAdd ? "+" : "−";
    if (useAdd) {
      rawNum = aConverted + bConverted;
    } else {
      // ensure positive result
      if (aConverted <= bConverted) {
        bNum = 1 + Math.floor(rng() * Math.max(1, Math.floor(aConverted * bDen / commonDen) - 1));
        const bConv2 = bNum * (commonDen / bDen);
        rawNum = aConverted - bConv2;
        if (rawNum <= 0) {
          // fallback to add
          rawNum = aConverted + bConverted;
        }
      } else {
        rawNum = aConverted - bConverted;
      }
    }

    if (rawNum <= 0) rawNum = aConverted + bConverted;

    const [sNum, sDen] = simplify(rawNum, commonDen);
    const ansWhole = Math.floor(sNum / sDen);
    const ansPartNum = sNum % sDen;

    problems.push({
      aNum, aDen, bNum, bDen,
      ansNum: sNum, ansDen: sDen,
      op: opSym,
      ...(ansWhole > 0 && ansPartNum > 0 ? { ansWhole, ansPartNum } : {}),
    });
  }
  return problems;
}

/* ---- volume ---- */
export function generateVolume(
  seed: number,
  shape: "cube" | "rect" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const useCube = shape === "cube" ? true : shape === "rect" ? false : rng() < 0.4;

    if (useCube) {
      const side = 1 + Math.floor(rng() * 10);
      const vol = side * side * side;
      problems.push({
        question: `一辺${side}cmの立方体の体積は？`,
        answer: `${vol}cm³`,
      });
    } else {
      const a = 2 + Math.floor(rng() * 10);
      const b = 2 + Math.floor(rng() * 10);
      const c = 2 + Math.floor(rng() * 10);
      const vol = a * b * c;
      problems.push({
        question: `たて${a}cm、よこ${b}cm、高さ${c}cmの直方体の体積は？`,
        answer: `${vol}cm³`,
      });
    }
  }
  return problems;
}

/* ---- circumference ---- */
export function generateCircumference(
  seed: number,
  mode: "forward" | "reverse" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const sub = mode === "mixed" ? (rng() < 0.6 ? "forward" : "reverse") : mode;

    if (sub === "forward") {
      const d = 1 + Math.floor(rng() * 20);
      const circ = d * 3.14;
      const circStr = Number(circ.toFixed(2)).toString();
      problems.push({
        question: `直径${d}cmの円の円周は？（円周率3.14）`,
        answer: `${circStr}cm`,
      });
    } else {
      // reverse: given circumference, find diameter
      const d = 2 + Math.floor(rng() * 20);
      const circ = d * 3.14;
      const circStr = Number(circ.toFixed(2)).toString();
      problems.push({
        question: `円周が${circStr}cmの円の直径は？（円周率3.14）`,
        answer: `${d}cm`,
      });
    }
  }
  return problems;
}

/* ---- even-odd ---- */
export function generateEvenOdd(
  seed: number,
  range: number,
): EvenOddProblem[] {
  const rng = mulberry32(seed);
  const problems: EvenOddProblem[] = [];

  for (let i = 0; i < 15; i++) {
    const count = 8 + Math.floor(rng() * 5); // 8-12 numbers
    const numbers: number[] = [];
    for (let j = 0; j < count; j++) {
      numbers.push(1 + Math.floor(rng() * range));
    }
    const evenAnswers = numbers.filter(n => n % 2 === 0).sort((a, b) => a - b);
    const oddAnswers = numbers.filter(n => n % 2 !== 0).sort((a, b) => a - b);
    problems.push({ numbers, evenAnswers, oddAnswers });
  }
  return problems;
}

/* ---- frac-compare ---- */
export function generateFracCompare(seed: number): FracCompareProblem[] {
  const rng = mulberry32(seed);
  const problems: FracCompareProblem[] = [];

  for (let i = 0; i < 15; i++) {
    const aDen = 2 + Math.floor(rng() * 9);
    const aNum = 1 + Math.floor(rng() * (aDen - 1));
    let bDen = 2 + Math.floor(rng() * 9);
    let bNum: number;

    if (i < 2) {
      // guarantee equal fractions
      const mult = 2 + Math.floor(rng() * 3);
      bDen = aDen * mult;
      bNum = aNum * mult;
    } else {
      bNum = 1 + Math.floor(rng() * (bDen - 1));
    }

    const aVal = aNum / aDen;
    const bVal = bNum / bDen;
    const answer: "＞" | "＜" | "＝" =
      Math.abs(aVal - bVal) < 1e-10 ? "＝" : aVal > bVal ? "＞" : "＜";

    problems.push({ aNum, aDen, bNum, bDen, answer });
  }
  return problems;
}

/* ---- unit-amount ---- */
export function generateUnitAmount(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const themes = [
    // [area, people, label for area, label for people]
    { area: "m²", people: "人", q: "1m²あたり何人？" },
    { area: "km²", people: "人", q: "人口密度（1km²あたりの人数）は？" },
  ];

  for (let i = 0; i < 8; i++) {
    const theme = themes[Math.floor(rng() * themes.length)];
    const unitArea = 5 + Math.floor(rng() * 20);
    const perUnit = 2 + Math.floor(rng() * 8);
    const total = unitArea * perUnit;

    if (rng() < 0.5) {
      // find per unit
      problems.push({
        question: `面積${unitArea}${theme.area}に${total}${theme.people}います。${theme.q}`,
        answer: `${perUnit}${theme.people}`,
      });
    } else {
      // find total
      problems.push({
        question: `1${theme.area}あたり${perUnit}${theme.people}で、面積が${unitArea}${theme.area}のとき、全部で何${theme.people}？`,
        answer: `${total}${theme.people}`,
      });
    }
  }
  return problems;
}

/* ---- decimal-shift ---- */
export function generateDecimalShift(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const muls = [10, 100, 1000];
  const divs = [10, 100, 1000];

  for (let i = 0; i < 10; i++) {
    // generate a decimal number
    const intPart = 1 + Math.floor(rng() * 99);
    const decPart = Math.floor(rng() * 100);
    const n = intPart + decPart / 100;
    const nStr = n % 1 === 0 ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

    if (rng() < 0.5) {
      const mul = muls[Math.floor(rng() * muls.length)];
      const result = n * mul;
      const resultStr = result % 1 === 0 ? String(result) : Number(result.toFixed(5)).toString();
      problems.push({ question: `${nStr}の${mul}倍は？`, answer: resultStr });
    } else {
      const div = divs[Math.floor(rng() * divs.length)];
      const result = n / div;
      const resultStr = Number(result.toFixed(5)).toString();
      problems.push({ question: `${nStr}の1/${div}は？`, answer: resultStr });
    }
  }
  return problems;
}

/* ---- pattern-eq ---- */
export function generatePatternEq(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 6; i++) {
    const a = 2 + Math.floor(rng() * 8); // coefficient
    const b = Math.floor(rng() * 10); // constant (0 for y=ax)

    // show a table and ask for the rule
    const xs = [1, 2, 3, 4, 5];
    const ys = xs.map(x => a * x + b);

    const tableStr = xs.map((x, j) => `x=${x}のときy=${ys[j]}`).join("、");
    const ruleStr = b === 0 ? `y ＝ ${a} × x` : `y ＝ ${a} × x ＋ ${b}`;

    problems.push({
      question: `${tableStr} のとき、xとyの関係を式で表しなさい`,
      answer: ruleStr,
    });
  }
  return problems;
}
