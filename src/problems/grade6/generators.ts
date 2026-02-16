import { mulberry32 } from "../random";
import { gcd, lcm, simplify } from "../shared/math-utils";

/* ================================================================
   Types
   ================================================================ */

export interface FracProblem {
  aNum: number; aDen: number;
  bNum: number; bDen: number;
  ansNum: number; ansDen: number;
  /** optional whole part for mixed number answers */
  ansWhole?: number;
  ansPartNum?: number;
}

export interface TextProblem {
  question: string;
  answer: string;
}

export interface ProportionProblem {
  label: string; // "比例" or "反比例"
  xValues: number[];
  yValues: (number | null)[];
  answers: number[];
}

export interface RepresentativeProblem {
  data: number[];
  meanAnswer: string;
  medianAnswer: string;
  modeAnswer: string;
}

export interface FreqTableProblem {
  data: number[];
  classWidth: number;
  classStart: number;
  classes: string[];
  frequencies: (number | null)[];
  answers: number[];
}

// Re-export for backwards compatibility
export { gcd, simplify };

/* ================================================================
   Generators
   ================================================================ */

export function generateFracMul(seed: number): FracProblem[] {
  const rng = mulberry32(seed);
  const problems: FracProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const aDen = 2 + Math.floor(rng() * 9);
    const aNum = 1 + Math.floor(rng() * (aDen * 2));
    const bDen = 2 + Math.floor(rng() * 9);
    const bNum = 1 + Math.floor(rng() * (bDen * 2));

    const rawNum = aNum * bNum;
    const rawDen = aDen * bDen;
    const [sNum, sDen] = simplify(rawNum, rawDen);

    const ansWhole = Math.floor(sNum / sDen);
    const ansPartNum = sNum % sDen;

    problems.push({
      aNum, aDen, bNum, bDen,
      ansNum: sNum, ansDen: sDen,
      ...(ansWhole > 0 && ansPartNum > 0 ? { ansWhole, ansPartNum } : {}),
    });
  }
  return problems;
}

export function generateFracDiv(seed: number): FracProblem[] {
  const rng = mulberry32(seed);
  const problems: FracProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const aDen = 2 + Math.floor(rng() * 9);
    const aNum = 1 + Math.floor(rng() * (aDen * 2));
    const bDen = 2 + Math.floor(rng() * 9);
    const bNum = 1 + Math.floor(rng() * (bDen * 2));

    // a/b ÷ c/d = a/b × d/c = (a*d)/(b*c)
    const rawNum = aNum * bDen;
    const rawDen = aDen * bNum;
    const [sNum, sDen] = simplify(rawNum, rawDen);

    const ansWhole = Math.floor(sNum / sDen);
    const ansPartNum = sNum % sDen;

    problems.push({
      aNum, aDen, bNum, bDen,
      ansNum: sNum, ansDen: sDen,
      ...(ansWhole > 0 && ansPartNum > 0 ? { ansWhole, ansPartNum } : {}),
    });
  }
  return problems;
}

export function generateRatio(
  seed: number,
  type: "simplify" | "fill" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const t = type === "mixed"
      ? (rng() < 0.5 ? "simplify" : "fill")
      : type;

    if (t === "simplify") {
      // Simplify a ratio: e.g. "12:18 → 2:3"
      const base1 = 1 + Math.floor(rng() * 9);
      const base2 = 1 + Math.floor(rng() * 9);
      const mult = 2 + Math.floor(rng() * 5);
      const a = base1 * mult;
      const b = base2 * mult;
      const g = gcd(a, b);
      problems.push({
        question: `${a}：${b} を最も簡単な整数の比にしなさい`,
        answer: `${a / g}：${b / g}`,
      });
    } else {
      // Fill blank: "3:5 = □:20" → 12
      const a = 1 + Math.floor(rng() * 9);
      const b = 1 + Math.floor(rng() * 9);
      const mult = 2 + Math.floor(rng() * 5);
      if (rng() < 0.5) {
        // blank on left: □:b*mult = a:b → □ = a*mult
        problems.push({
          question: `${a}：${b} ＝ □：${b * mult}`,
          answer: `${a * mult}`,
        });
      } else {
        // blank on right: a*mult:□ = a:b → □ = b*mult
        problems.push({
          question: `${a}：${b} ＝ ${a * mult}：□`,
          answer: `${b * mult}`,
        });
      }
    }
  }
  return problems;
}

export function generateCircleArea(
  seed: number,
  type: "basic" | "half" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const t = type === "mixed"
      ? (rng() < 0.6 ? "basic" : "half")
      : type;

    const radius = 1 + Math.floor(rng() * 15);

    if (t === "basic") {
      const area = radius * radius * 3.14;
      // round to 2 decimal places
      const areaStr = Number(area.toFixed(2)).toString();
      problems.push({
        question: `半径${radius}cmの円の面積は？（円周率3.14）`,
        answer: `${areaStr}cm²`,
      });
    } else {
      // semicircle
      const area = radius * radius * 3.14 / 2;
      const areaStr = Number(area.toFixed(2)).toString();
      problems.push({
        question: `半径${radius}cmの半円の面積は？（円周率3.14）`,
        answer: `${areaStr}cm²`,
      });
    }
  }
  return problems;
}

export function generateProportion(
  seed: number,
  propType: "direct" | "inverse" | "mixed",
): ProportionProblem[] {
  const rng = mulberry32(seed);
  const problems: ProportionProblem[] = [];

  for (let i = 0; i < 6; i++) {
    const isDirect = propType === "direct" ? true
      : propType === "inverse" ? false
      : rng() < 0.5;

    const constant = 2 + Math.floor(rng() * 11); // 2-12
    const xValues = [1, 2, 3, 4, 5, 6];

    if (isDirect) {
      // y = constant * x
      const allY = xValues.map(x => constant * x);
      // blank 2 random y values
      const blankIndices = new Set<number>();
      while (blankIndices.size < 2) {
        blankIndices.add(Math.floor(rng() * 6));
      }
      const yValues: (number | null)[] = allY.map((y, idx) =>
        blankIndices.has(idx) ? null : y
      );
      const answers = [...blankIndices].sort().map(idx => allY[idx]);
      problems.push({ label: "比例", xValues, yValues, answers });
    } else {
      // y = constant / x — only use x values that divide evenly
      const xVals = [1, 2, 3, 4, 6]; // all divide into reasonable numbers
      const c = (2 + Math.floor(rng() * 5)) * 12; // 24,36,48,60,72 — divisible by 1,2,3,4,6
      const allY = xVals.map(x => c / x);
      const blankIndices = new Set<number>();
      while (blankIndices.size < 2) {
        blankIndices.add(Math.floor(rng() * xVals.length));
      }
      const yValues: (number | null)[] = allY.map((y, idx) =>
        blankIndices.has(idx) ? null : y
      );
      const answers = [...blankIndices].sort().map(idx => allY[idx]);
      problems.push({ label: "反比例", xValues: xVals, yValues, answers });
    }
  }
  return problems;
}

/* ================================================================
   NEW generators
   ================================================================ */

/* ---- literal-expr (文字式の値) ---- */
export function generateLiteralExpr(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const templates1 = [
    (x: number, a: number, b: number) => ({
      expr: `${a} × x ＋ ${b}`, val: a * x + b,
    }),
    (x: number, a: number, b: number) => ({
      expr: `${a} × x − ${b}`, val: a * x - b,
    }),
    (x: number, a: number, _b: number) => ({
      expr: `x × x ＋ ${a}`, val: x * x + a,
    }),
    (x: number, a: number, _b: number) => ({
      expr: `(x ＋ ${a}) × 2`, val: (x + a) * 2,
    }),
  ];

  for (let i = 0; i < 10; i++) {
    const x = 1 + Math.floor(rng() * 10);
    const a = 1 + Math.floor(rng() * 9);
    const b = 1 + Math.floor(rng() * 9);

    if (rng() < 0.7) {
      // single variable
      const tmpl = templates1[Math.floor(rng() * templates1.length)];
      const { expr, val } = tmpl(x, a, b);
      if (val >= 0) {
        problems.push({
          question: `x ＝ ${x} のとき、${expr} の値は？`,
          answer: `${val}`,
        });
      } else {
        // fallback
        problems.push({
          question: `x ＝ ${x} のとき、${a} × x ＋ ${b} の値は？`,
          answer: `${a * x + b}`,
        });
      }
    } else {
      // two variables
      const y = 1 + Math.floor(rng() * 10);
      const val = a * x + y;
      problems.push({
        question: `a ＝ ${x}、b ＝ ${y} のとき、${a} × a ＋ b の値は？`,
        answer: `${val}`,
      });
    }
  }
  return problems;
}

/* ---- representative (代表値) ---- */
export function generateRepresentative(
  seed: number,
  _find?: "mean" | "median" | "mode" | "mixed",
): RepresentativeProblem[] {
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
}

/* ---- counting (場合の数) ---- */
export function generateCounting(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const permTemplates = [
    (n: number) => ({
      q: `${n}枚のカード${Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i)).join(", ")}の並べ方は何通り？`,
      a: factorial(n),
    }),
    (n: number) => ({
      q: `${n}人が1列に並ぶ方法は何通り？`,
      a: factorial(n),
    }),
  ];

  const combTemplates = [
    (n: number, r: number) => ({
      q: `${n}人から${r}人を選ぶ組み合わせは何通り？`,
      a: comb(n, r),
    }),
    (n: number, r: number) => ({
      q: `${n}つの中から${r}つを選ぶ方法は何通り？`,
      a: comb(n, r),
    }),
  ];

  for (let i = 0; i < 8; i++) {
    if (rng() < 0.5) {
      // permutation
      const n = 3 + Math.floor(rng() * 3); // 3-5
      const tmpl = permTemplates[Math.floor(rng() * permTemplates.length)];
      const { q, a } = tmpl(n);
      problems.push({ question: q, answer: `${a}通り` });
    } else {
      // combination
      const n = 4 + Math.floor(rng() * 3); // 4-6
      const r = 2 + Math.floor(rng() * Math.min(2, n - 2)); // 2-3
      const tmpl = combTemplates[Math.floor(rng() * combTemplates.length)];
      const { q, a } = tmpl(n, r);
      problems.push({ question: q, answer: `${a}通り` });
    }
  }
  return problems;
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function comb(n: number, r: number): number {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

/* ---- prism-volume ---- */
export function generatePrismVolume(
  seed: number,
  shape: "prism" | "cylinder" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const useCylinder = shape === "cylinder" ? true : shape === "prism" ? false : rng() < 0.5;

    if (useCylinder) {
      const r = 1 + Math.floor(rng() * 10);
      const h = 1 + Math.floor(rng() * 15);
      const vol = r * r * 3.14 * h;
      const volStr = Number(vol.toFixed(2)).toString();
      problems.push({
        question: `底面の半径${r}cm、高さ${h}cmの円柱の体積は？（円周率3.14）`,
        answer: `${volStr}cm³`,
      });
    } else {
      // triangular prism: base area = base * height / 2
      const type = Math.floor(rng() * 2);
      if (type === 0) {
        // triangular prism
        const base = 2 + Math.floor(rng() * 8) * 2; // even for clean division
        const triHeight = 2 + Math.floor(rng() * 10);
        const h = 2 + Math.floor(rng() * 10);
        const baseArea = (base * triHeight) / 2;
        const vol = baseArea * h;
        problems.push({
          question: `底面が底辺${base}cm・高さ${triHeight}cmの三角形で、高さ${h}cmの三角柱の体積は？`,
          answer: `${vol}cm³`,
        });
      } else {
        // quadrilateral prism (given base area)
        const baseArea = (2 + Math.floor(rng() * 20)) * 5; // multiples of 5
        const h = 2 + Math.floor(rng() * 10);
        const vol = baseArea * h;
        problems.push({
          question: `底面積${baseArea}cm²、高さ${h}cmの角柱の体積は？`,
          answer: `${vol}cm³`,
        });
      }
    }
  }
  return problems;
}

/* ---- scale (縮尺) ---- */
export function generateScale(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const scales = [1000, 2000, 5000, 10000, 25000, 50000];

  for (let i = 0; i < 10; i++) {
    const scale = scales[Math.floor(rng() * scales.length)];

    if (rng() < 0.5) {
      // map → real
      const mapCm = 1 + Math.floor(rng() * 20);
      const realCm = mapCm * scale;
      const realM = realCm / 100;
      if (realM >= 1000) {
        problems.push({
          question: `縮尺1/${scale}の地図で${mapCm}cmは実際には何km？`,
          answer: `${realM / 1000}km`,
        });
      } else {
        problems.push({
          question: `縮尺1/${scale}の地図で${mapCm}cmは実際には何m？`,
          answer: `${realM}m`,
        });
      }
    } else {
      // real → map
      const realM = (1 + Math.floor(rng() * 20)) * (scale >= 10000 ? 100 : 10);
      const mapCm = (realM * 100) / scale;
      const mapStr = Number.isInteger(mapCm) ? String(mapCm) : Number(mapCm.toFixed(1)).toString();
      problems.push({
        question: `実際の距離${realM}mを縮尺1/${scale}の地図に描くと何cm？`,
        answer: `${mapStr}cm`,
      });
    }
  }
  return problems;
}

/* ---- frac-mixed-calc (分数の四則混合) ---- */
export function generateFracMixedCalc(seed: number): FracProblem[] {
  const rng = mulberry32(seed);
  const problems: FracProblem[] = [];

  for (let i = 0; i < 10; i++) {
    // Generate: a/b op1 c/d where op1 is +,-,*,/
    // Then combine with second op. For simplicity, generate 2-term mixed expressions.
    const aDen = 2 + Math.floor(rng() * 8);
    const aNum = 1 + Math.floor(rng() * (aDen * 2));
    const bDen = 2 + Math.floor(rng() * 8);
    const bNum = 1 + Math.floor(rng() * (bDen * 2));

    // For mixed calc, use multiply then add/sub with a simple fraction
    const cDen = 2 + Math.floor(rng() * 5);
    const cNum = 1 + Math.floor(rng() * (cDen - 1));

    // Compute aNum/aDen × bNum/bDen + cNum/cDen
    const mulNum = aNum * bNum;
    const mulDen = aDen * bDen;
    const [smNum, smDen] = simplify(mulNum, mulDen);

    const commonDen = lcm(smDen, cDen);
    const addResult = smNum * (commonDen / smDen) + cNum * (commonDen / cDen);
    const [sNum, sDen] = simplify(addResult, commonDen);

    const ansWhole = Math.floor(sNum / sDen);
    const ansPartNum = sNum % sDen;

    problems.push({
      aNum, aDen, bNum, bDen,
      ansNum: sNum, ansDen: sDen,
      ...(ansWhole > 0 && ansPartNum > 0 ? { ansWhole, ansPartNum } : {}),
    });
  }
  return problems;
}

/* ---- freq-table (度数分布表) ---- */
export function generateFreqTable(seed: number): FreqTableProblem[] {
  const rng = mulberry32(seed);
  const problems: FreqTableProblem[] = [];

  for (let t = 0; t < 4; t++) {
    const n = 15 + Math.floor(rng() * 11); // 15-25 data points
    const classWidth = [5, 10][Math.floor(rng() * 2)];
    const classStart = 0;
    const numClasses = 4 + Math.floor(rng() * 3); // 4-6 classes

    // generate data within range
    const maxVal = classStart + classWidth * numClasses;
    const data: number[] = [];
    for (let i = 0; i < n; i++) {
      data.push(classStart + Math.floor(rng() * maxVal));
    }

    // compute frequencies
    const classes: string[] = [];
    const freqValues: number[] = [];
    for (let c = 0; c < numClasses; c++) {
      const lo = classStart + c * classWidth;
      const hi = lo + classWidth;
      classes.push(`${lo}以上${hi}未満`);
      freqValues.push(data.filter(d => d >= lo && d < hi).length);
    }

    // blank 2-3 frequencies
    const numBlanks = 2 + Math.floor(rng() * 2);
    const blankSet = new Set<number>();
    while (blankSet.size < numBlanks && blankSet.size < numClasses) {
      blankSet.add(Math.floor(rng() * numClasses));
    }

    const frequencies: (number | null)[] = freqValues.map((f, idx) =>
      blankSet.has(idx) ? null : f
    );
    const answers = [...blankSet].sort().map(idx => freqValues[idx]);

    problems.push({ data, classWidth, classStart, classes, frequencies, answers });
  }
  return problems;
}
