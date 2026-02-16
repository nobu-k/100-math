import { mulberry32 } from "../random";

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

/* ================================================================
   Helpers
   ================================================================ */

export function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

export function simplify(num: number, den: number): [number, number] {
  const g = gcd(num, den);
  return [num / g, den / g];
}

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
