import { mulberry32 } from "../random";

/* ================================================================
   Types
   ================================================================ */

export interface DecompositionProblem {
  target: number;
  given: number;
  answer: number;
  /** "left"  → target = given + □
   *  "right" → target = □ + given */
  position: "left" | "right";
}

export interface FillBlankProblem {
  /** null = blank */
  left: number | null;
  right: number | null;
  result: number;
  op: "+" | "−";
  answer: number;
}

export interface ComparisonProblem {
  left: number;
  right: number;
  answer: "＞" | "＜" | "＝";
}

export interface SequenceProblem {
  cells: (number | null)[]; // null = blank
  answers: number[];
}

export interface ClockProblem {
  hour: number;   // 1‑12
  minute: number; // 0‑59
}

/* ================================================================
   Generators
   ================================================================ */

export function generateDecomposition(
  seed: number,
  target: number,
): DecompositionProblem[] {
  const rng = mulberry32(seed);
  const problems: DecompositionProblem[] = [];
  for (let i = 0; i < 12; i++) {
    const given = 1 + Math.floor(rng() * (target - 1));
    const answer = target - given;
    const position: "left" | "right" = rng() < 0.5 ? "left" : "right";
    problems.push({ target, given, answer, position });
  }
  return problems;
}

export function generateFillBlank(
  seed: number,
  max: number,
  mode: "add" | "sub" | "mixed",
): FillBlankProblem[] {
  const rng = mulberry32(seed);
  const problems: FillBlankProblem[] = [];
  for (let i = 0; i < 12; i++) {
    const useAdd =
      mode === "add" ? true : mode === "sub" ? false : rng() < 0.5;
    if (useAdd) {
      const c = 2 + Math.floor(rng() * (max - 1));
      const a = 1 + Math.floor(rng() * (c - 1));
      const b = c - a;
      if (rng() < 0.5) {
        problems.push({ left: null, right: b, result: c, op: "+", answer: a });
      } else {
        problems.push({ left: a, right: null, result: c, op: "+", answer: b });
      }
    } else {
      const a = 2 + Math.floor(rng() * (max - 1));
      const b = 1 + Math.floor(rng() * (a - 1));
      const c = a - b;
      if (rng() < 0.5) {
        problems.push({ left: null, right: b, result: c, op: "−", answer: a });
      } else {
        problems.push({ left: a, right: null, result: c, op: "−", answer: b });
      }
    }
  }
  return problems;
}

export function generateComparison(
  seed: number,
  max: number,
): ComparisonProblem[] {
  const rng = mulberry32(seed);
  const problems: ComparisonProblem[] = [];
  for (let i = 0; i < 15; i++) {
    let left: number, right: number;
    if (i < 2) {
      // guarantee a couple of equal pairs
      left = 1 + Math.floor(rng() * max);
      right = left;
    } else {
      left = 1 + Math.floor(rng() * max);
      right = 1 + Math.floor(rng() * max);
    }
    const answer: "＞" | "＜" | "＝" =
      left > right ? "＞" : left < right ? "＜" : "＝";
    problems.push({ left, right, answer });
  }
  return problems;
}

export function generateSequence(
  seed: number,
  step: number,
  max: number,
): SequenceProblem[] {
  const rng = mulberry32(seed);
  const problems: SequenceProblem[] = [];
  const length = 8;

  for (let i = 0; i < 6; i++) {
    const ascending = rng() < 0.7;
    let start: number;
    if (ascending) {
      const maxStart = max - step * (length - 1);
      if (maxStart < 1) {
        start = step;
      } else {
        start = 1 + Math.floor(rng() * maxStart);
        if (step > 1) start = Math.max(step, Math.ceil(start / step) * step);
      }
    } else {
      const minStart = step * (length - 1) + 1;
      if (minStart > max) {
        start = max;
      } else {
        start = minStart + Math.floor(rng() * (max - minStart + 1));
        if (step > 1) start = Math.floor(start / step) * step;
        if (start < minStart) start = minStart;
      }
    }

    const allNums: number[] = [];
    for (let j = 0; j < length; j++) {
      allNums.push(ascending ? start + step * j : start - step * j);
    }

    // pick 3 blanks (not first or last)
    const inner = Array.from({ length: length - 2 }, (_, k) => k + 1);
    for (let j = inner.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [inner[j], inner[k]] = [inner[k], inner[j]];
    }
    const blankSet = new Set(inner.slice(0, 3));

    const cells: (number | null)[] = [];
    const answers: number[] = [];
    for (let j = 0; j < length; j++) {
      if (blankSet.has(j)) {
        cells.push(null);
        answers.push(allNums[j]);
      } else {
        cells.push(allNums[j]);
      }
    }
    problems.push({ cells, answers });
  }
  return problems;
}

export function generateClock(
  seed: number,
  precision: "hour" | "half" | "5min" | "1min",
): ClockProblem[] {
  const rng = mulberry32(seed);
  const problems: ClockProblem[] = [];
  for (let i = 0; i < 8; i++) {
    const hour = 1 + Math.floor(rng() * 12);
    let minute: number;
    switch (precision) {
      case "hour":
        minute = 0;
        break;
      case "half":
        minute = rng() < 0.5 ? 0 : 30;
        break;
      case "5min":
        minute = Math.floor(rng() * 12) * 5;
        break;
      case "1min":
        minute = Math.floor(rng() * 60);
        break;
    }
    problems.push({ hour, minute });
  }
  return problems;
}
