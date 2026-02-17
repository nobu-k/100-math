import { mulberry32 } from "../random";

export interface FracCompareProblem {
  aNum: number; aDen: number;
  bNum: number; bDen: number;
  answer: "＞" | "＜" | "＝";
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
