import { mulberry32 } from "../random";

export interface PosNegAddSubProblem {
  /** The terms in the expression, e.g. [+3, -7, +2] */
  terms: number[];
  /** The answer */
  answer: number;
}

export function generatePosNegAddSub(
  seed: number,
  termCount: 2 | 3 = 2,
  includeDecimals: boolean = false,
): PosNegAddSubProblem[] {
  const rng = mulberry32(seed);
  const problems: PosNegAddSubProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 15; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const terms: number[] = [];
      for (let t = 0; t < termCount; t++) {
        let val: number;
        if (includeDecimals && rng() < 0.3) {
          val = Math.round((rng() * 20 - 10) * 10) / 10;
          if (val === 0) val = 0.5;
        } else {
          val = Math.floor(rng() * 21) - 10;
          if (val === 0) val = 1;
        }
        terms.push(val);
      }
      const answer = terms.reduce((a, b) => a + b, 0);
      // Keep answer in reasonable range
      if (Math.abs(answer) > 30) continue;
      // Round answer for decimals
      const roundedAnswer = Math.round(answer * 10) / 10;
      const key = terms.join(",");
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push({ terms, answer: roundedAnswer });
        break;
      }
    }
  }
  return problems;
}
