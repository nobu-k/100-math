import { mulberry32 } from "../random";
import { gcd } from "../shared/math-utils";

export type TrigRatioMode = "evaluate" | "identity" | "obtuse" | "mixed";

export interface TrigRatioProblem {
  expr: string;
  answerExpr: string;
}

export const generateTrigRatio = (
  seed: number,
  mode: TrigRatioMode = "mixed",
  count = 12,
): TrigRatioProblem[] => {
  const rng = mulberry32(seed);
  const problems: TrigRatioProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: TrigRatioProblem | null = null;
      if (pick === "evaluate") result = generateEvaluate(rng);
      else if (pick === "identity") result = generateIdentity(rng);
      else result = generateObtuse(rng);

      if (!result) continue;

      const key = result.expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push(result);
        break;
      }
    }
  }
  return problems;
};

/* ================================================================
   Mode selection
   ================================================================ */

const pickMode = (
  rng: () => number,
  mode: TrigRatioMode,
): "evaluate" | "identity" | "obtuse" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.4) return "evaluate";
  if (r < 0.7) return "identity";
  return "obtuse";
};

/* ================================================================
   Evaluate mode: find exact sin/cos/tan at standard angles
   ================================================================ */

/** Angles available for evaluate mode (skip 90° for tan) */
const EVAL_ANGLES = [30, 45, 60, 120, 135, 150] as const;
const TRIG_FUNCS = ["sin", "cos", "tan"] as const;

/** Unicode exact-value table for display (rationalized where needed) */
const UNICODE_VALUES: Record<number, Record<string, string>> = {
  30:  { sin: "1/2",   cos: "√3/2",  tan: "√3/3" },
  45:  { sin: "√2/2",  cos: "√2/2",  tan: "1" },
  60:  { sin: "√3/2",  cos: "1/2",   tan: "√3" },
  120: { sin: "√3/2",  cos: "−1/2",  tan: "−√3" },
  135: { sin: "√2/2",  cos: "−√2/2", tan: "−1" },
  150: { sin: "1/2",   cos: "−√3/2", tan: "−√3/3" },
};

const generateEvaluate = (rng: () => number): TrigRatioProblem | null => {
  const angle = EVAL_ANGLES[Math.floor(rng() * EVAL_ANGLES.length)];
  const func = TRIG_FUNCS[Math.floor(rng() * TRIG_FUNCS.length)];

  // Skip tan 90° — already excluded from EVAL_ANGLES
  const entry = UNICODE_VALUES[angle];
  if (!entry) return null;

  const answerExpr = entry[func];
  const expr = `${func} ${angle}°`;

  return { expr, answerExpr };
};

/* ================================================================
   Identity mode: given one trig ratio, find another
   using sin²θ + cos²θ = 1 and tanθ = sinθ/cosθ
   ================================================================ */

interface PythTriple { a: number; b: number; c: number }

const PYTH_TRIPLES: PythTriple[] = [
  { a: 3, b: 4, c: 5 },
  { a: 5, b: 12, c: 13 },
  { a: 8, b: 15, c: 17 },
  { a: 7, b: 24, c: 25 },
];

const generateIdentity = (rng: () => number): TrigRatioProblem | null => {
  const triple = PYTH_TRIPLES[Math.floor(rng() * PYTH_TRIPLES.length)];
  const { a, b, c } = triple;

  // sinθ = a/c, cosθ = b/c, tanθ = a/b  (acute angle, 0°<θ<90°)
  const variant = Math.floor(rng() * 6);

  let givenFunc: string;
  let givenNum: number;
  let givenDen: number;
  let askFunc: string;
  let ansNum: number;
  let ansDen: number;

  if (variant === 0) {
    // Given sinθ = a/c, find cosθ
    givenFunc = "sin"; givenNum = a; givenDen = c;
    askFunc = "cos"; ansNum = b; ansDen = c;
  } else if (variant === 1) {
    // Given sinθ = a/c, find tanθ
    givenFunc = "sin"; givenNum = a; givenDen = c;
    askFunc = "tan"; ansNum = a; ansDen = b;
  } else if (variant === 2) {
    // Given cosθ = b/c, find sinθ
    givenFunc = "cos"; givenNum = b; givenDen = c;
    askFunc = "sin"; ansNum = a; ansDen = c;
  } else if (variant === 3) {
    // Given cosθ = b/c, find tanθ
    givenFunc = "cos"; givenNum = b; givenDen = c;
    askFunc = "tan"; ansNum = a; ansDen = b;
  } else if (variant === 4) {
    // Given tanθ = a/b, find sinθ
    givenFunc = "tan"; givenNum = a; givenDen = b;
    askFunc = "sin"; ansNum = a; ansDen = c;
  } else {
    // Given tanθ = a/b, find cosθ
    givenFunc = "tan"; givenNum = a; givenDen = b;
    askFunc = "cos"; ansNum = b; ansDen = c;
  }

  const givenFrac = fmtFrac(givenNum, givenDen);
  const ansFrac = fmtFrac(ansNum, ansDen);

  const expr = `${givenFunc} θ = ${givenFrac} のとき，${askFunc} θ の値`;
  const answerExpr = ansFrac;

  return { expr, answerExpr };
};

/* ================================================================
   Obtuse mode: supplementary angle properties
   sin(180°−θ) = sinθ, cos(180°−θ) = −cosθ, tan(180°−θ) = −tanθ
   ================================================================ */

const OBTUSE_ANGLES = [120, 135, 150] as const;

const generateObtuse = (rng: () => number): TrigRatioProblem | null => {
  const angle = OBTUSE_ANGLES[Math.floor(rng() * OBTUSE_ANGLES.length)];
  const func = TRIG_FUNCS[Math.floor(rng() * TRIG_FUNCS.length)];

  const entry = UNICODE_VALUES[angle];
  if (!entry) return null;

  const supplement = 180 - angle; // the acute reference angle
  const answerExpr = entry[func];

  // Express as supplementary: "sin(180° − 60°)" for sin 120°
  const expr = `${func}(180° − ${supplement}°)`;

  return { expr, answerExpr };
};

/* ================================================================
   Formatting helpers
   ================================================================ */

/** Format a fraction in Unicode, reducing by GCD */
const fmtFrac = (num: number, den: number): string => {
  const g = gcd(Math.abs(num), Math.abs(den));
  const rn = num / g;
  const rd = den / g;
  if (rd === 1) return `${rn}`;
  return `${rn}/${rd}`;
};
